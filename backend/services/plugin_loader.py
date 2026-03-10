import os
import json
import logging
import importlib.util
import importlib
from fastapi import FastAPI

from typing import Dict, Any

log = logging.getLogger(__name__)

# Global registry of loaded plugins
_plugins: Dict[str, Any] = {}

PLUGINS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../plugins")
) if '__file__' in locals() else os.path.abspath(os.path.join(os.getcwd(), "../plugins"))


def load_plugins(app: FastAPI) -> None:
    """
    Scans the plugins directory and dynamically loads active plugins.

    For each plugin directory containing a plugin.json manifest:
      1. Reads and validates the manifest (must have 'enabled': true)
      2. Loads hooks.py (if present) so the plugin registers its event handlers
      3. Loads router.py (if present) and mounts its `router` onto the FastAPI app
         — this is how plugins expose API endpoints without touching main.py
    """
    global _plugins
    _plugins.clear()
    log.info("Scanning for plugins...")

    if not os.path.exists(PLUGINS_DIR):
        log.warning(f"Plugins directory not found: {PLUGINS_DIR}")
        return

    for item in os.listdir(PLUGINS_DIR):
        plugin_path = os.path.join(PLUGINS_DIR, item)

        if not os.path.isdir(plugin_path):
            continue

        manifest_path = os.path.join(plugin_path, "plugin.json")
        if not os.path.exists(manifest_path):
            log.debug(f"Skipping {item}: No plugin.json found")
            continue

        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)

            if not manifest.get("enabled", False):
                log.info(f"Plugin '{item}' is disabled — skipping")
                continue

            plugin_name = manifest.get("name", item)
            _plugins[plugin_name] = {
                "manifest": manifest,
                "path": plugin_path,
                "status": "loading",
            }

            # ── 1. Load hooks.py ─────────────────────────────────────────────
            hooks_file = os.path.join(plugin_path, "hooks.py")
            if os.path.exists(hooks_file):
                _load_module(item, "hooks")
                log.info(f"[plugin_loader] Loaded hooks for plugin: {item}")

            # ── 2. Load router.py and mount routes ───────────────────────────
            router_file = os.path.join(plugin_path, "router.py")
            if os.path.exists(router_file):
                router_module = _load_module(item, "router")
                if router_module and hasattr(router_module, "router"):
                    app.include_router(router_module.router)
                    log.info(
                        f"[plugin_loader] Mounted routes for plugin '{item}' "
                        f"(prefix: {getattr(router_module.router, 'prefix', '/')})"
                    )
                else:
                    log.warning(f"[plugin_loader] router.py in '{item}' has no 'router' attribute")

            _plugins[plugin_name]["status"] = "active"
            log.info(f"[plugin_loader] Plugin '{plugin_name}' loaded successfully")

        except Exception as e:
            log.error(f"Failed to load plugin '{item}': {e}", exc_info=True)
            if item in _plugins:
                _plugins[item]["status"] = "error"

    log.info(f"[plugin_loader] Loaded {len(_plugins)} plugins: {', '.join(_plugins.keys())}")


def _load_module(plugin_folder: str, module_name: str):
    """
    Load a plugin module via spec_from_file_location.
    Consistent with product_loader — prevents name collision between plugins.
    Each plugin gets a unique fully-qualified module name: plugins.<folder>.<module>
    """
    module_path = os.path.join(PLUGINS_DIR, plugin_folder, f"{module_name}.py")
    if not os.path.exists(module_path):
        log.error(f"Module not found: {module_path}")
        return None
    unique_name = f"plugins.{plugin_folder}.{module_name}"
    spec = importlib.util.spec_from_file_location(unique_name, module_path)
    if spec and spec.loader:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    log.error(f"Could not create spec for {unique_name}")
    return None
