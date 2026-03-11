# ॥ ॐ श्री गणेशाय नमः ॥
#
# Organization: AITDL — AI Technology Development Lab
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com
"""
CMS Core Plugin — Main Router — plugins/cms_core/router.py
"""

import logging
from fastapi import APIRouter

from .routers import pages, cards, blog, media, workspaces, forms

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cms", tags=["CMS"])

router.include_router(pages.router)
router.include_router(cards.router)
router.include_router(blog.router)
router.include_router(media.router)
router.include_router(workspaces.router)
router.include_router(forms.router)

try:
    from .routers import cms_ai
    router.include_router(cms_ai.router)
    log.info("cms_core: AI sub-router loaded")
except ImportError:
    log.warning("cms_core: cms_ai router not found — AI endpoints unavailable")

log.info("cms_core: All sub-routers mounted under /api/cms")
