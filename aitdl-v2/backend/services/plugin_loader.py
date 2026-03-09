import os
import json
import logging
import importlib.util
from fastapi import FastAPI

from typing import Dict, Any

log = logging.getLogger(__name__)

# Global registry of loaded plugins
_plugins: Dict[str, Any] = {}

PLUGINS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../plugins")) if '__file__' in locals() else os.path.abspath(os.path.join(os.getcwd(), "../plugins"))


def load_plugins(app: FastAPI) -> None:
    """
    Scans the plugins directory and dynamically loads active plugins.
    """
    global _plugins
    _plugins.clear()
    log.info("Scanning for plugins...")
    
    if not os.path.exists(PLUGINS_DIR):
        log.warning(f"Plugins directory not found: {PLUGINS_DIR}")
        return

    loaded_plugins = []

    for item in os.listdir(PLUGINS_DIR):
        plugin_path = os.path.join(PLUGINS_DIR, item)
        
        if not os.path.isdir(plugin_path):
            continue
            
        manifest_path = os.path.join(plugin_path, "plugin.json")
        
        if not os.path.exists(manifest_path):
            log.debug(f"Skipping {item}: No plugin.json found")
            continue
            
            # Store in registry
            plugin_name = manifest.get("name", item)
            _plugins[plugin_name] = {
                "manifest": manifest,
                "path": plugin_path,
                "status": "loading"
            }

            # Execute backend logic or register routes if needed securely
            # For iteration 1, we just scan for hooks.py and load it so it can register itself
            hooks_file = os.path.join(plugin_path, "hooks.py")
            if os.path.exists(hooks_file):
                _load_module(item, hooks_file)
                log.info(f"Loaded plugin hooks for: {item}")
                _plugins[plugin_name]["status"] = "active"
            else:
                _plugins[plugin_name]["status"] = "active" # No hooks is still active
                
        except Exception as e:
            log.error(f"Failed to load plugin {item}: {e}", exc_info=True)
            
    log.info(f"Loaded {len(_plugins)} plugins: {', '.join(_plugins.keys())}")


def _load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(f"plugins.{name}", path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    return None
