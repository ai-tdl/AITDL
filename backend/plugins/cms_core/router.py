""" ॥ ॐ श्री गणेशाय नमः ॥
Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Plugin: cms_core · router.py
Purpose: Aggregates all CMS sub-routers into a single APIRouter
         so plugin_loader can mount them via the standard router.py convention.
"""

import logging
from fastapi import APIRouter

from .routers import pages, cards, blog, media, workspaces

log = logging.getLogger(__name__)

# ── Master CMS router ──────────────────────────────────────────────────────
# All CMS endpoints will be prefixed with /api/cms
# This matches what the tests expect:
#   POST   /api/cms/workspaces
#   POST   /api/cms/pages
#   GET    /api/cms/pages/{slug}
#   POST   /api/cms/ai/generate   ← loaded separately below
# ──────────────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/api/cms", tags=["CMS"])

# ── Sub-routers ──
router.include_router(pages.router)
router.include_router(cards.router)
router.include_router(blog.router)
router.include_router(media.router)
router.include_router(workspaces.router)

# ── CMS AI router (optional — load only if module exists) ──
try:
    from .routers import cms_ai
    router.include_router(cms_ai.router)
    log.info("cms_core: AI sub-router loaded")
except ImportError:
    log.warning("cms_core: cms_ai router not found — skipping")

log.info("cms_core: All sub-routers mounted under /api/cms")
