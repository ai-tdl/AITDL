# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Core Plugin — Main Router — plugins/cms-core/router.py

Purpose : Aggregates all CMS sub-routers into a single APIRouter
          mounted at /api/v1/cms by the plugin_loader.
          Also exposes the workspace export endpoint.

All CMS endpoints share:
  - prefix : /api/v1/cms
  - auth   : require_cms_user (minimum) via each sub-router's Depends
"""

import sys, os, uuid, json, logging
from typing import Optional, List
from datetime import datetime

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_workspace_admin, get_current_workspace
from cms_core.models.cms_tables import (
    Workspace, Page, Card, BlogPost, MediaAsset, CMSForm, CMSSubmission
)
from cms_core.routers import pages, cards, blog, media, forms, workspaces, ai as ai_router

log = logging.getLogger(__name__)

# ── Main CMS Router ────────────────────────────────────────────────────────────
router = APIRouter(prefix="/api/v1/cms")

# Mount all sub-routers
router.include_router(pages.router)
router.include_router(cards.router)
router.include_router(blog.router)
router.include_router(media.router)
router.include_router(forms.router)
router.include_router(workspaces.router)
router.include_router(ai_router.router)
