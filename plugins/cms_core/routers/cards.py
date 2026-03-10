# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab
#
# Creator: Jawahar R. Mallah
#
# Then: 628 CE · Brahmasphuṭasiddhānta
# Now: 9 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Cards Router — plugins/cms-core/routers/cards.py

Endpoints:
    GET    /api/v1/cms/cards              — list root cards (?tag=retail)
    POST   /api/v1/cms/cards              — create card
    PATCH  /api/v1/cms/cards/{id}         — update card
    DELETE /api/v1/cms/cards/{id}         — delete card
    GET    /api/v1/cms/cards/{id}/children — list sub-cards
"""

import sys, os, uuid, logging
from datetime import datetime, timezone
from typing import Optional, List

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend"))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_cms_user, get_current_workspace
from cms_core.models.cms_tables import Card, Workspace, CMSAuditLog

log = logging.getLogger(__name__)
router = APIRouter(tags=["CMS — Cards"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class CardCreate(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=300)
    description: Optional[str] = None
    parent_id:   Optional[uuid.UUID] = None
    icon:        Optional[str] = Field(default=None, max_length=50)
    badge:       Optional[str] = Field(default=None, max_length=50)
    cta_text:    Optional[str] = Field(default=None, max_length=100)
    cta_url:     Optional[str] = None
    sort_order:  int           = Field(default=0, ge=0)
    enabled:     bool          = True
    tags:        List[str]     = Field(default_factory=list)

class CardUpdate(BaseModel):
    title:       Optional[str]      = Field(default=None, max_length=300)
    description: Optional[str]      = None
    icon:        Optional[str]      = Field(default=None, max_length=50)
    badge:       Optional[str]      = Field(default=None, max_length=50)
    cta_text:    Optional[str]      = Field(default=None, max_length=100)
    cta_url:     Optional[str]      = None
    sort_order:  Optional[int]      = Field(default=None, ge=0)
    enabled:     Optional[bool]     = None
    tags:        Optional[List[str]] = None

class CardOut(BaseModel):
    id: uuid.UUID; workspace_id: uuid.UUID; parent_id: Optional[uuid.UUID]
    title: str; description: Optional[str]
    icon: Optional[str]; badge: Optional[str]
    cta_text: Optional[str]; cta_url: Optional[str]
    sort_order: int; enabled: bool; tags: list
    created_at: datetime; updated_at: datetime
    class Config: from_attributes = True


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_card_or_404(card_id: uuid.UUID, workspace_id: uuid.UUID, db: AsyncSession) -> Card:
    result = await db.execute(
        select(Card).where(Card.id == card_id, Card.workspace_id == workspace_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

async def _audit(db, workspace_id, actor, action, rid, diff=None):
    db.add(CMSAuditLog(id=uuid.uuid4(), workspace_id=workspace_id,
                       actor_email=actor, action=action, resource_type="card",
                       resource_id=str(rid), diff=diff))


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/cards", response_model=List[CardOut])
async def list_cards(
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
    tag: Optional[str] = Query(default=None, description="Filter by tag (e.g. retail, student, ngo)"),
    enabled_only: bool = Query(default=False),
):
    """List root cards (parent_id=None) in the workspace. Optionally filter by tag."""
    q = select(Card).where(Card.workspace_id == workspace.id, Card.parent_id == None)  # noqa: E711
    if tag:
        q = q.where(Card.tags.contains([tag]))
    if enabled_only:
        q = q.where(Card.enabled == True)  # noqa: E712
    q = q.order_by(Card.sort_order)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/cards/{card_id}/children", response_model=List[CardOut])
async def list_sub_cards(
    card_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """List all sub-cards (children) of a root card."""
    await _get_card_or_404(card_id, workspace.id, db)
    result = await db.execute(
        select(Card).where(Card.parent_id == card_id).order_by(Card.sort_order)
    )
    return result.scalars().all()


@router.post("/cards", response_model=CardOut, status_code=status.HTTP_201_CREATED)
async def create_card(
    body: CardCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Create a root card or sub-card. Max nesting depth = 2 levels."""
    # Enforce max 2 levels: if parent has a parent, reject
    if body.parent_id:
        parent = await _get_card_or_404(body.parent_id, workspace.id, db)
        if parent.parent_id is not None:
            raise HTTPException(
                status_code=400,
                detail="Cards support maximum 2 nesting levels (card → sub-card). Cannot create sub-sub-card."
            )

    actor = payload.get("sub", "unknown")
    card = Card(
        id=uuid.uuid4(), workspace_id=workspace.id, parent_id=body.parent_id,
        title=body.title, description=body.description, icon=body.icon,
        badge=body.badge, cta_text=body.cta_text, cta_url=body.cta_url,
        sort_order=body.sort_order, enabled=body.enabled, tags=body.tags,
    )
    db.add(card)
    await _audit(db, workspace.id, actor, "created", card.id)
    await db.commit()
    await db.refresh(card)
    return card


@router.patch("/cards/{card_id}", response_model=CardOut)
async def update_card(
    card_id: uuid.UUID,
    body: CardUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Update card fields. Supports partial updates."""
    card = await _get_card_or_404(card_id, workspace.id, db)
    actor = payload.get("sub", "unknown")

    if body.title is not None:       card.title = body.title
    if body.description is not None: card.description = body.description
    if body.icon is not None:        card.icon = body.icon
    if body.badge is not None:       card.badge = body.badge
    if body.cta_text is not None:    card.cta_text = body.cta_text
    if body.cta_url is not None:     card.cta_url = body.cta_url
    if body.sort_order is not None:  card.sort_order = body.sort_order
    if body.enabled is not None:     card.enabled = body.enabled
    if body.tags is not None:        card.tags = body.tags
    card.updated_at = datetime.now(timezone.utc)

    await _audit(db, workspace.id, actor, "updated", card_id)
    await db.commit()
    await db.refresh(card)
    return card


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Delete card and all its sub-cards (CASCADE)."""
    card = await _get_card_or_404(card_id, workspace.id, db)
    actor = payload.get("sub", "unknown")
    await _audit(db, workspace.id, actor, "deleted", card_id)
    await db.delete(card)
    await db.commit()
