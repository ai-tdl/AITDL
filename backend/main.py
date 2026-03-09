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

from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.logging_config import setup_logging
import platform_kernel

# Initialize structured logging before anything else
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle management for the AITDL Platform.
    Delegates initialization to the Platform Kernel.
    """
    # ── Platform Kernel Bootstrap ─────────────────────────────────────────────────
    kernel = platform_kernel.bootstrap(app)
    await kernel.initialize()
    # ──────────────────────────────────────────────────────────────────────────────
    yield

app = FastAPI(
    title="AITDL Platform API",
    description="Central gateway for AITDL Core, Plugins, and Products.",
    version="3.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

@app.get("/health")
async def health():
    """Platform health check."""
    return {"status": "ok", "version": "3.1.0", "org": "AITDL"}

@app.get("/platform/health")
async def platform_health():
    """Official Operational Health Endpoint."""
    return {
        "platform": "AITDL",
        "version": "3.1.0",
        "status": "running"
    }
