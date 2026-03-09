# AITDL V3 Modular Ecosystem - Architectural Skeleton

This document provides a high-level overview of the AITDL V3 modular architecture, including the directory structure and the core loader/registry implementations. It is intended for third-party architectural review.

## Directory Structure

```text
aitdl-v2/
├── .github
│   └── workflows
│       └── deploy.yml
├── .gitignore
├── README.md
├── ade
│   └── README.md
├── agents
│   └── README.md
├── aitdl_v3_architecture_skeleton.md
├── backend
│   ├── .env
│   ├── .env.example
│   ├── core
│   │   ├── aitdl_identity.py
│   │   ├── config.py
│   │   ├── cors.py
│   │   ├── database.py
│   │   ├── rate_limit.py
│   │   ├── security.py
│   │   └── supabase_client.py
│   ├── db
│   │   └── migrations
│   │       ├── 001_initial.sql
│   │       ├── 002_admins.sql
│   │       ├── 003_lead_status.sql
│   │       ├── 004_partner_status.sql
│   │       ├── 005_rls_policies.sql
│   │       └── 006_add_email.sql
│   ├── main.py
│   ├── models
│   │   ├── contact.py
│   │   ├── db_tables.py
│   │   └── partner.py
│   ├── requirements.txt
│   ├── routers
│   │   ├── admin.py
│   │   ├── ai.py
│   │   ├── auth.py
│   │   ├── contact.py
│   │   └── partner.py
│   ├── server_out.log
│   └── services
│       ├── ai_gateway.py
│       ├── hooks.py
│       ├── plugin_loader.py
│       └── product_loader.py
├── core
│   ├── aitdl_identity.json
│   ├── brand.json
│   ├── products.json
│   └── segments.json
├── deploy
│   ├── railway.json
│   └── vercel.json
├── docs
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── DEPLOYMENT.md
│   ├── PHASE_TRACKER.md
│   └── aitdl_signature.md
├── frontend
│   ├── admin
│   │   ├── css
│   │   │   └── admin.css
│   │   ├── dashboard.html
│   │   ├── index.html
│   │   └── js
│   │       ├── admin-auth.js
│   │       ├── admin-leads.js
│   │       ├── admin-stats.js
│   │       └── admin-users.js
│   ├── css
│   │   ├── animations.css
│   │   ├── main.css
│   │   └── themes.css
│   ├── index.html
│   └── js
│       ├── canvas.js
│       ├── config.js
│       ├── forms.js
│       ├── main.js
│       └── picker.js
├── guardian
│   └── README.md
├── pil
│   ├── README.md
│   ├── dependency_map.json
│   ├── module_index.json
│   └── project_map.json
├── plugins
│   ├── ai-assistant
│   │   ├── hooks.py
│   │   └── plugin.json
│   ├── analytics
│   │   ├── hooks.py
│   │   └── plugin.json
│   ├── payments
│   │   ├── hooks.py
│   │   └── plugin.json
│   └── whatsapp
│       ├── hooks.py
│       └── plugin.json
├── products
│   ├── _product_template
│   │   ├── backend
│   │   │   └── router.py
│   │   ├── frontend
│   │   │   └── index.html
│   │   └── product.json
│   ├── dailyboard
│   │   ├── backend
│   │   │   └── router.py
│   │   ├── frontend
│   │   └── product.json
│   └── ganitsutram
│       └── product.json
├── pytest.ini
├── rules
│   └── RULESBOOK.md
├── scripts
│   ├── aitdl_signature.py
│   ├── check_admin.py
│   ├── create_admin.py
│   ├── create_db.py
│   ├── deploy.sh
│   ├── export_skeleton.py
│   ├── migrate.py
│   └── seed.py
├── shared
│   ├── components
│   ├── ui
│   └── utils
├── tests
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_contact.py
│   └── test_partner.py
└── themes
    └── default
        ├── css
        │   └── variables.css
        └── theme.json
```

## Core Architecture & Loaders

The platform utilizes dynamic loaders to scan and mount isolated Products and Plugins at runtime without mutating core application code.

### `backend/main.py`
```py
# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab
#
# Creator: Jawahar R. Mallah
# Founder, Author & System Architect
#
# Email: jawahar@aitdl.com
# GitHub: https://github.com/jawahar-mallah
#
# Websites:
# https://ganitsutram.com
# https://aitdl.com
#
# Then: 628 CE · Brahmasphuṭasiddhānta
# Now: 8 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core.config import settings
from core.cors import cors_origins
from core.rate_limit import limiter
from routers import contact, partner, auth, admin, ai
from services import product_loader, plugin_loader


app = FastAPI(
    title="AITDL V3 Ecosystem API",
    description="Modular backend for AITDL Core Services, Products, and Plugins.",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Routers
app.include_router(contact.router, prefix="/api")
app.include_router(partner.router, prefix="/api")
app.include_router(auth.router)      # prefix already set in router: /api/auth
app.include_router(admin.router)     # prefix already set in router: /api/admin
app.include_router(ai.router)        # prefix already set in router: /api/ai

# ── Dynamic Ecosystem Loaders ─────────────────────────────────────────────────
plugin_loader.load_plugins(app)
product_loader.load_products(app)
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "3.0.0", "org": "AITDL"}

```

### `backend/services/product_loader.py`
```py
import os
import json
import logging
import importlib.util
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles

log = logging.getLogger(__name__)

# Absolute path resolution logic to ensure survival across cwd changes
base_dir = os.path.dirname(__file__) if '__file__' in locals() else os.getcwd()
PRODUCTS_DIR = os.path.abspath(os.path.join(base_dir, "../../products"))


def load_products(app: FastAPI) -> None:
    """
    Scans the products directory and dynamically mounts product routers and static files.
    """
    log.info("Scanning for products...")
    
    if not os.path.exists(PRODUCTS_DIR):
        log.warning(f"Products directory not found: {PRODUCTS_DIR}")
        return

    loaded_products = []

    for item in os.listdir(PRODUCTS_DIR):
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
                
            product_name = manifest.get("name", item)
            
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

            loaded_products.append(product_name)
            
        except Exception as e:
            log.error(f"Failed to load product {item}: {e}", exc_info=True)
            
    log.info(f"Loaded {len(loaded_products)} products: {', '.join(loaded_products)}")


def _load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(f"products.{name}.router", path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    return None

```

### `backend/services/plugin_loader.py`
```py
import os
import json
import logging
import importlib.util
from fastapi import FastAPI

log = logging.getLogger(__name__)

PLUGINS_DIR = os.path.abspath(os.path.join(os.path.dirname(__line__), "../../plugins")) if '__file__' in locals() else os.path.abspath(os.path.join(os.getcwd(), "../plugins"))


def load_plugins(app: FastAPI) -> None:
    """
    Scans the plugins directory and dynamically loads active plugins.
    """
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
            
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
                
            # Execute backend logic or register routes if needed securely
            # For iteration 1, we just scan for hooks.py and load it so it can register itself
            hooks_file = os.path.join(plugin_path, "hooks.py")
            if os.path.exists(hooks_file):
                _load_module(item, hooks_file)
                log.info(f"Loaded plugin hooks for: {item}")
                
            loaded_plugins.append(manifest.get("name", item))
            
        except Exception as e:
            log.error(f"Failed to load plugin {item}: {e}", exc_info=True)
            
    log.info(f"Loaded {len(loaded_plugins)} plugins: {', '.join(loaded_plugins)}")


def _load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(f"plugins.{name}", path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    return None

```

### `backend/services/hooks.py`
```py
import logging
from typing import Callable, Dict, List, Any

log = logging.getLogger(__name__)

# Registry mapping event names to lists of callback functions
_hooks: Dict[str, List[Callable]] = {}

def register(event_name: str, callback: Callable) -> None:
    """
    Register a callback function to be executed when an event is triggered.
    """
    if event_name not in _hooks:
        _hooks[event_name] = []
    
    _hooks[event_name].append(callback)
    log.debug(f"Registered hook for event: {event_name}")

async def trigger(event_name: str, *args: Any, **kwargs: Any) -> None:
    """
    Trigger all registered callbacks for a specific event.
    Executes asynchronously.
    """
    if event_name not in _hooks:
        return

    callbacks = _hooks[event_name]
    log.debug(f"Triggering {len(callbacks)} hooks for event: {event_name}")
    
    for callback in callbacks:
        try:
            # Check if callback is an async coroutine or a standard function
            import asyncio
            if asyncio.iscoroutinefunction(callback):
                await callback(*args, **kwargs)
            else:
                callback(*args, **kwargs)
        except Exception as e:
            log.error(f"Error executing hook '{event_name}': {e}", exc_info=True)

```

### `backend/services/ai_gateway.py`
```py
import logging
from enum import Enum
from typing import Dict, Any, Optional

log = logging.getLogger(__name__)

class AISource(str, Enum):
    LOCAL = "local"
    OPEN_SOURCE = "open_source"
    PREMIUM = "premium"


class TaskComplexity(str, Enum):
    BASIC = "basic"
    CONTENT = "content"
    ADVANCED = "advanced"


def _determine_source(task_type: TaskComplexity) -> AISource:
    """
    Routs the task to the most appropriate AI tier based on complexity.
    """
    if task_type == TaskComplexity.BASIC:
        return AISource.LOCAL
    elif task_type == TaskComplexity.CONTENT:
        return AISource.OPEN_SOURCE
    elif task_type == TaskComplexity.ADVANCED:
        return AISource.PREMIUM
    return AISource.LOCAL


async def generate_response(prompt: str, task_type: TaskComplexity = TaskComplexity.BASIC, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Universal entry point for the Hybrid AI Layer.
    """
    source = _determine_source(task_type)
    log.info(f"Routing AI request: task='{task_type}' -> provider='{source}'")

    if source == AISource.LOCAL:
        return await _call_local_model(prompt, context)
    elif source == AISource.OPEN_SOURCE:
        return await _call_opensource_model(prompt, context)
    elif source == AISource.PREMIUM:
        return await _call_premium_model(prompt, context)
    
    raise ValueError(f"Unknown AI Source: {source}")


async def _call_local_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    # TODO: Integrate with Ollama / Local LLaMA instance
    log.debug("Executing local AI model simulation...")
    return {
        "provider": "ollama_local",
        "model": "llama3:8b",
        "response": f"[Local AI] I am processing your basic request: {prompt[:30]}...",
        "status": "success"
    }


async def _call_opensource_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    # TODO: Integrate with HuggingFace Inference API or similar
    log.debug("Executing open-source AI model simulation...")
    return {
        "provider": "huggingface",
        "model": "mixtral-8x7b-instruct",
        "response": f"[Open-Source AI] Generating content for: {prompt[:30]}...",
        "status": "success"
    }


async def _call_premium_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    # TODO: Integrate with OpenAI / Anthropic APIs
    log.debug("Executing premium AI model simulation...")
    return {
        "provider": "openai",
        "model": "gpt-4-turbo",
        "response": f"[Premium AI] Performing advanced reasoning on: {prompt[:30]}...",
        "status": "success"
    }

```

### `products/ganitsutram/product.json`
```json
{
    "name": "ganitsutram",
    "version": "2.0.0",
    "standalone": false,
    "description": "The primary flagship product integrating the core AI and knowledge engines.",
    "plugins": [
        "analytics",
        "whatsapp"
    ],
    "theme": "vedic-classic"
}
```

### `plugins/ai-assistant/plugin.json`
```json
{
    "name": "ai-assistant",
    "version": "1.0.0",
    "description": "Universal AI chat widget and generative helpers powered by AI Gateway.",
    "author": "AITDL"
}
```

### `plugins/ai-assistant/hooks.py`
```py
import logging
from services import hooks

log = logging.getLogger(__name__)

def on_system_ready(*args, **kwargs):
    log.info("[AI Assistant] Plugin initialized and ready to intercept queries.")

# Register to the core system event
hooks.register("on_system_ready", on_system_ready)

```

### `themes/default/theme.json`
```json
{
    "name": "default",
    "version": "1.0.0",
    "description": "Baseline CSS custom properties for AITDL UI components.",
    "author": "AITDL"
}
```

