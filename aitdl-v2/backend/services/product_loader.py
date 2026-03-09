import os
import json
import logging
import importlib.util
from typing import Dict, Any, List
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles

log = logging.getLogger(__name__)

# Absolute path resolution logic to ensure survival across cwd changes
base_dir = os.path.dirname(__file__) if '__file__' in locals() else os.getcwd()
PRODUCTS_DIR = os.path.abspath(os.path.join(base_dir, "../../products"))


# Global registry of loaded products
_products: Dict[str, Any] = {}


def load_products(app: FastAPI) -> None:
    """
    Scans the products directory and dynamically mounts product routers and static files.
    """
    from services.plugin_loader import _plugins
    global _products
    _products.clear()
    log.info("Scanning for products...")
    
    if not os.path.exists(PRODUCTS_DIR):
        log.warning(f"Products directory not found: {PRODUCTS_DIR}")
        return

    loaded_products = []
    for item in os.listdir(PRODUCTS_DIR):
        if item.startswith('_'):
            continue  # skip templates
            
        product_path = os.path.join(PRODUCTS_DIR, item)
        
        # Must be a directory containing a product.json
        if not os.path.isdir(product_path):
            continue
            
        manifest_path = os.path.join(product_path, "product.json")
        if not os.path.exists(manifest_path):
            log.debug(f"Skipping {item}: No product.json found")
            continue
            
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)

            if not manifest.get('enabled', True):
                log.info(f'Skipping disabled product: {item}')
                continue
                
            product_name = manifest.get("name", item)
            
            # Store in registry
            _products[product_name] = {
                "manifest": manifest,
                "path": product_path,
                "status": "loading",
                "route_prefix": f"/api/{product_name}",
                "missing_plugins": []
            }

            # 0. Validate dependencies
            required_plugins = manifest.get("plugins", [])
            for plugin in required_plugins:
                if plugin not in _plugins:
                    _products[product_name]["missing_plugins"].append(plugin)
            
            if _products[product_name]["missing_plugins"]:
                log.error(f"Product {product_name} missing required plugins: {_products[product_name]['missing_plugins']}")
                _products[product_name]["status"] = "plugin_error"
                # We still mount it but the admin will show the error

            # 1. Mount static frontend assets if they exist
            frontend_dir = os.path.join(product_path, "frontend")
            if os.path.exists(frontend_dir):
                # We mount using the product name (e.g., /ganitsutram)
                app.mount(f"/{product_name}", StaticFiles(directory=frontend_dir, html=True), name=f"product_{product_name}")
                log.info(f"Mounted static frontend for product: {product_name}")

            # 2. Mount backend Router if it exists
            router_file = os.path.join(product_path, "backend", "router.py")
            if os.path.exists(router_file):
                module = _load_module(item, router_file)
                if module and hasattr(module, 'router') and isinstance(module.router, APIRouter):
                    # Inject into the /api/{product_name} namespace
                    app.include_router(module.router, prefix=f"/api/{product_name}", tags=[f"Product: {product_name.title()}"])
                    log.info(f"Mounted API router for product: {product_name}")
                    _products[product_name]["status"] = "active"
                else:
                    _products[product_name]["status"] = "router_error"
            else:
                # If no router, it's just a frontend product
                _products[product_name]["status"] = "active"

        except Exception as e:
            log.error(f"Failed to load product {item}: {e}", exc_info=True)
            
    log.info(f"Loaded {len(_products)} products: {', '.join(_products.keys())}")


def _load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(f"products.{name}.router", path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    return None
