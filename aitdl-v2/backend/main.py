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

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core.logging_config import setup_logging
from core.logging_config import setup_logging
from core.config import settings
from core.cors import cors_origins
from core.rate_limit import limiter
from routers import contact, partner, auth, admin, ai
from services import product_loader, plugin_loader, hooks

# Initialize structured logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Dynamic Ecosystem Loaders ─────────────────────────────────────────────────
    plugin_loader.load_plugins(app)
    product_loader.load_products(app)
    await hooks.trigger('on_system_ready')
    # ──────────────────────────────────────────────────────────────────────────────
    yield

app = FastAPI(
    title="AITDL V3 Ecosystem API",
    description="Modular backend for AITDL Core Services, Products, and Plugins.",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
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


@app.get("/health")
async def health():
    return {"status": "ok", "version": "3.0.0", "org": "AITDL"}
