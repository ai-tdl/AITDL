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
# Then: 628 CE · Brahmasphuṭasiddhānta
# Now: 9 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Pages & Blocks Router — plugins/cms-core/routers/pages.py

Endpoints:
    GET    /api/v1/cms/pages              — list pages in workspace
    POST   /api/v1/cms/pages              — create page
    GET    /api/v1/cms/pages/{id}         — get single page
    PATCH  /api/v1/cms/pages/{id}         — update page (optimistic lock)
    DELETE /api/v1/cms/pages/{id}         — delete page
    POST   /api/v1/cms/pages/{id}/duplicate — clone page

    GET    /api/v1/cms/pages/{id}/blocks  — list blocks (ordered)
    POST   /api/v1/cms/pages/{id}/blocks  — add block
    PATCH  /api/v1/cms/blocks/{id}        — update block
    DELETE /api/v1/cms/blocks/{id}        — delete block
    POST   /api/v1/cms/blocks/reorder     — reorder all blocks on a page
"""

import sys, os, uuid, logging
from datetime import datetime, timezone
from typing import Optional, List

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_cms_user, get_current_workspace
from cms_core.models.cms_tables import Page, Block, Workspace, ContentVersion, CMSAuditLog

log = logging.getLogger(__name__)
router = APIRouter(tags=["CMS — Pages & Blocks"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class PageCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug:  str = Field(..., min_length=1, max_length=255, pattern=r'^[a-z0-9/_-]+$')
    status:   str = Field(default="draft")
    template: str = Field(default="custom")

class PageUpdate(BaseModel):
    title:           Optional[str] = Field(default=None, max_length=500)
    slug:            Optional[str] = Field(default=None, max_length=255)
    status:          Optional[str] = None
    seo_title:       Optional[str] = Field(default=None, max_length=60)
    seo_description: Optional[str] = Field(default=None, max_length=155)

class PageOut(BaseModel):
    id: uuid.UUID; workspace_id: uuid.UUID; title: str; slug: str
    status: str; template: str
    seo_title: Optional[str]; seo_description: Optional[str]
    last_modified_by: Optional[str]
    published_at: Optional[datetime]
    created_by: Optional[str]
    created_at: datetime; updated_at: datetime
    class Config: from_attributes = True

class BlockCreate(BaseModel):
    type:       str = Field(..., min_length=1)
    sort_order: int = Field(default=0, ge=0)
    config:     dict = Field(default_factory=dict)

class BlockUpdate(BaseModel):
    config:       Optional[dict] = None
    sort_order:   Optional[int]  = None
    ai_generated: Optional[bool] = None

class BlockOut(BaseModel):
    id: uuid.UUID; page_id: uuid.UUID; type: str; sort_order: int
    config: dict; ai_generated: bool
    created_at: datetime; updated_at: datetime
    class Config: from_attributes = True

class ReorderRequest(BaseModel):
    page_id:    uuid.UUID
    block_ids:  List[uuid.UUID]  # ordered list of block UUIDs


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_page_or_404(page_id: uuid.UUID, workspace_id: uuid.UUID, db: AsyncSession) -> Page:
    result = await db.execute(
        select(Page).where(Page.id == page_id, Page.workspace_id == workspace_id)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page

async def _audit(db, workspace_id, actor, action, rtype, rid, diff=None):
    log_entry = CMSAuditLog(
        id=uuid.uuid4(), workspace_id=workspace_id, actor_email=actor,
        action=action, resource_type=rtype, resource_id=rid, diff=diff
    )
    db.add(log_entry)


# ── Page Endpoints ─────────────────────────────────────────────────────────────

@router.get("/pages", response_model=List[PageOut])
async def list_pages(
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
    status_filter: Optional[str] = None,
):
    """List all pages in the current workspace, newest first."""
    q = select(Page).where(Page.workspace_id == workspace.id)
    if status_filter:
        q = q.where(Page.status == status_filter)
    q = q.order_by(Page.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/pages", response_model=PageOut, status_code=status.HTTP_201_CREATED)
async def create_page(
    body: PageCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Create a new page in the workspace. Slug must be unique per workspace."""
    # Check slug uniqueness
    exists = await db.execute(
        select(Page).where(Page.workspace_id == workspace.id, Page.slug == body.slug)
    )
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Slug '{body.slug}' already exists in this workspace")

    actor = payload.get("sub", "unknown")
    page = Page(
        id=uuid.uuid4(), workspace_id=workspace.id,
        title=body.title, slug=body.slug, status=body.status,
        template=body.template, created_by=actor, last_modified_by=actor,
    )
    db.add(page)
    await _audit(db, workspace.id, actor, "created", "page", page.id)
    await db.commit()
    await db.refresh(page)
    log.info(f"[cms] Page created: {page.id} slug={page.slug} by {actor}")
    return page


@router.get("/pages/{page_id}", response_model=PageOut)
async def get_page(
    page_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """Get a single page by ID."""
    return await _get_page_or_404(page_id, workspace.id, db)


@router.patch("/pages/{page_id}", response_model=PageOut)
async def update_page(
    page_id: uuid.UUID,
    body: PageUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
    if_match: Optional[str] = Header(default=None, alias="If-Match"),
):
    """
    Update page metadata. Supports optimistic locking via If-Match header.
    If-Match value should be the page's updated_at ISO timestamp.
    Returns 409 Conflict if the page was modified since the client last fetched it.
    """
    page = await _get_page_or_404(page_id, workspace.id, db)

    # Optimistic lock check
    if if_match is not None:
        server_ts = page.updated_at.isoformat() if page.updated_at else ""
        if if_match != server_ts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Page was modified by another editor. Please refresh and try again."
            )

    actor = payload.get("sub", "unknown")
    before = {"title": page.title, "slug": page.slug, "status": page.status}

    # Save version snapshot before update
    version_result = await db.execute(
        select(ContentVersion).where(
            ContentVersion.resource_type == "page", ContentVersion.resource_id == page_id
        )
    )
    existing_versions = version_result.scalars().all()
    version = ContentVersion(
        id=uuid.uuid4(), workspace_id=workspace.id, resource_type="page",
        resource_id=page_id, version_num=len(existing_versions) + 1,
        snapshot={"title": page.title, "slug": page.slug, "status": page.status,
                  "seo_title": page.seo_title, "seo_description": page.seo_description},
        saved_by=actor,
    )
    db.add(version)

    # Apply updates
    if body.title is not None:           page.title = body.title
    if body.slug is not None:            page.slug = body.slug
    if body.status is not None:          page.status = body.status
    if body.seo_title is not None:       page.seo_title = body.seo_title
    if body.seo_description is not None: page.seo_description = body.seo_description
    page.last_modified_by = actor
    page.updated_at = datetime.now(timezone.utc)

    after = {"title": page.title, "slug": page.slug, "status": page.status}
    await _audit(db, workspace.id, actor, "updated", "page", page_id, {"before": before, "after": after})
    await db.commit()
    await db.refresh(page)
    return page


@router.delete("/pages/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(
    page_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Delete a page and all its blocks (CASCADE)."""
    page = await _get_page_or_404(page_id, workspace.id, db)
    actor = payload.get("sub", "unknown")
    await _audit(db, workspace.id, actor, "deleted", "page", page_id)
    await db.delete(page)
    await db.commit()


@router.post("/pages/{page_id}/duplicate", response_model=PageOut, status_code=status.HTTP_201_CREATED)
async def duplicate_page(
    page_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Clone a page and all its blocks. New page gets slug='{original}-copy' and status=draft."""
    page = await _get_page_or_404(page_id, workspace.id, db)
    actor = payload.get("sub", "unknown")

    new_slug = f"{page.slug}-copy"
    # Ensure slug uniqueness by appending counter if needed
    counter = 1
    while True:
        exists = await db.execute(
            select(Page).where(Page.workspace_id == workspace.id, Page.slug == new_slug)
        )
        if not exists.scalar_one_or_none():
            break
        new_slug = f"{page.slug}-copy-{counter}"
        counter += 1

    new_page = Page(
        id=uuid.uuid4(), workspace_id=workspace.id,
        title=f"{page.title} (copy)", slug=new_slug,
        status="draft", template=page.template,
        seo_title=page.seo_title, seo_description=page.seo_description,
        created_by=actor, last_modified_by=actor,
    )
    db.add(new_page)

    # Clone all blocks
    blocks_result = await db.execute(
        select(Block).where(Block.page_id == page_id).order_by(Block.sort_order)
    )
    for blk in blocks_result.scalars().all():
        new_block = Block(
            id=uuid.uuid4(), page_id=new_page.id,
            type=blk.type, sort_order=blk.sort_order,
            config=blk.config, ai_generated=blk.ai_generated,
        )
        db.add(new_block)

    await _audit(db, workspace.id, actor, "created", "page", new_page.id,
                 {"cloned_from": page_id})
    await db.commit()
    await db.refresh(new_page)
    log.info(f"[cms] Page duplicated: {page_id} → {new_page.id}")
    return new_page


# ── Block Endpoints ────────────────────────────────────────────────────────────

@router.get("/pages/{page_id}/blocks", response_model=List[BlockOut])
async def list_blocks(
    page_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """List all blocks on a page, in sort_order."""
    await _get_page_or_404(page_id, workspace.id, db)
    result = await db.execute(
        select(Block).where(Block.page_id == page_id).order_by(Block.sort_order)
    )
    return result.scalars().all()


@router.post("/pages/{page_id}/blocks", response_model=BlockOut, status_code=status.HTTP_201_CREATED)
async def add_block(
    page_id: uuid.UUID,
    body: BlockCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Add a block to a page."""
    await _get_page_or_404(page_id, workspace.id, db)
    actor = payload.get("sub", "unknown")
    block = Block(
        id=uuid.uuid4(), page_id=page_id,
        type=body.type, sort_order=body.sort_order,
        config=body.config,
    )
    db.add(block)
    await _audit(db, workspace.id, actor, "created", "block", block.id)
    await db.commit()
    await db.refresh(block)
    return block


@router.patch("/blocks/{block_id}", response_model=BlockOut)
async def update_block(
    block_id: uuid.UUID,
    body: BlockUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Update a block's config or sort_order."""
    result = await db.execute(
        select(Block).where(Block.id == block_id)
    )
    block = result.scalar_one_or_none()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    actor = payload.get("sub", "unknown")
    if body.config is not None:       block.config = body.config
    if body.sort_order is not None:   block.sort_order = body.sort_order
    if body.ai_generated is not None: block.ai_generated = body.ai_generated
    block.updated_at = datetime.now(timezone.utc)

    await _audit(db, workspace.id, actor, "updated", "block", block_id)
    await db.commit()
    await db.refresh(block)
    return block


@router.delete("/blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_block(
    block_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Delete a block."""
    result = await db.execute(select(Block).where(Block.id == block_id))
    block = result.scalar_one_or_none()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    actor = payload.get("sub", "unknown")
    await _audit(db, workspace.id, actor, "deleted", "block", block_id)
    await db.delete(block)
    await db.commit()


@router.post("/blocks/reorder", status_code=status.HTTP_200_OK)
async def reorder_blocks(
    body: ReorderRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """
    Reorder blocks on a page. Accepts an ordered list of block UUIDs.
    Assigns sort_order = index position (0-based).
    """
    await _get_page_or_404(body.page_id, workspace.id, db)
    for idx, block_id in enumerate(body.block_ids):
        result = await db.execute(select(Block).where(Block.id == block_id, Block.page_id == body.page_id))
        block = result.scalar_one_or_none()
        if block:
            block.sort_order = idx
            block.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "ok", "reordered": len(body.block_ids)}
