"""
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core.logging_config import setup_logging
from core.config import settings
from core.cors import cors_origins
from core.rate_limit import limiter
from core.database import engine
from api import contact, partner, auth, admin, ai
from services import product_loader, plugin_loader, hooks

log = logging.getLogger(__name__)

class PlatformKernel:
    """
    The AITDL Platform Kernel is the central nervous system of the backend.
    It manages initialization, service discovery, and dynamic ecosystems.
    """

    def __init__(self, app: FastAPI):
        self.app = app

    async def initialize(self):
        """
        The bootstrap sequence for the AITDL Platform:
        1. Initialize core services
        2. Connect and verify database
        3. Load plugins dynamically
        4. Load products dynamically
        5. Mount API routers
        6. Start platform services
        """
        log.info("AITDL Platform Kernel: Initializing...")

        # 1. Initialize Core Services (Middleware, Rate Limiting, CORS)
        self._setup_middleware()
        
        # 2. Connect and Verify Database
        await self._verify_database()

        # 3. Dynamic Ecosystem: Plugins
        # Plugins MUST be loaded before products as products may depend on them.
        plugin_loader.load_plugins(self.app)
        
        # 4. Dynamic Ecosystem: Products
        product_loader.load_products(self.app)
        
        # 5. Mount Core Routers
        self._mount_routers()

        # 6. Trigger Startup Hooks
        await hooks.trigger('on_system_ready')
        log.info("AITDL Platform Kernel: Initialization Complete. System is LIVE.")

    def _setup_middleware(self):
        """Configure system-wide protection and access layers."""
        # Rate Limiting (Guardian Layer)
        self.app.state.limiter = limiter
        self.app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

        # CORS Protection
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins(),
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        log.info("Middleware and protection layers active.")

    async def _verify_database(self):
        """Verify database connectivity at startup."""
        try:
            async with engine.begin() as conn:
                await conn.execute("SELECT 1")
            log.info("Database connectivity verified.")
        except Exception as e:
            log.error(f"CRITICAL: Database connection failed: {e}")
            # In a production kernel, we might want to shut down or retry here.

    def _mount_routers(self):
        """Mount core platform API routers."""
        self.app.include_router(contact.router, prefix="/api", tags=["Core: Contact"])
        self.app.include_router(partner.router, prefix="/api", tags=["Core: Partner"])
        self.app.include_router(auth.router, tags=["Core: Auth"])
        self.app.include_router(admin.router, tags=["Core: Admin"])
        self.app.include_router(ai.router, tags=["Core: AI"])
        log.info("Core API routers mounted.")

def bootstrap(app: FastAPI) -> PlatformKernel:
    """
    EntryPoint for the Platform Kernel.
    """
    return PlatformKernel(app)
