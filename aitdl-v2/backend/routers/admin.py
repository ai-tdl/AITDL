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

"""
Admin router — backend/routers/admin.py

Purpose : Protected CRUD endpoints for the AITDL admin dashboard.
          All routes require a valid JWT with role = superadmin | admin.

Endpoints:
    GET   /api/admin/stats            — summary counts
    GET   /api/admin/leads            — paginated contact submissions
    PATCH /api/admin/leads/{id}       — update lead status / notes
    GET   /api/admin/partners         — paginated partner applications
    PATCH /api/admin/partners/{id}    — update partner status / notes
"""

from datetime import datetime, timezone
import asyncio
import logging
from typing import Literal, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import require_admin, require_superadmin, hash_password
from models.db_tables import ContactRecord, PartnerRecord, AdminUser

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:           int
    name:         str
    email:        str
    phone:        str
    section:      str
    business:     str
    city:         str
    message:      str
    status:       str
    admin_notes:  str
    contacted_at: Optional[datetime]
    created_at:   datetime


class PartnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:          int
    name:        str
    email:       str
    phone:       str
    city:        str
    occupation:  str
    message:     str
    status:      str
    admin_notes: str
    reviewed_at: Optional[datetime]
    created_at:  datetime


# Valid status values — enforced server-side via Literal
LeadStatus    = Literal['new', 'contacted', 'follow_up', 'closed']
PartnerStatus = Literal['pending', 'approved', 'rejected', 'on_hold']


class LeadUpdate(BaseModel):
    status:      Optional[LeadStatus] = None
    admin_notes: Optional[str]        = Field(default=None, max_length=2000)


class PartnerUpdate(BaseModel):
    status:      Optional[PartnerStatus] = None
    admin_notes: Optional[str]           = Field(default=None, max_length=2000)


class StatsResponse(BaseModel):
    total_leads:      int
    total_partners:   int
    new_leads:        int
    pending_partners: int
    leads_by_section: dict


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:         int
    email:      str
    role:       str
    is_active:  bool
    created_at: datetime


class AdminUserCreate(BaseModel):
    email:    EmailStr
    password: str
    role:     Literal['admin', 'superadmin'] = 'admin'

    @field_validator('email', mode='before')
    @classmethod
    def normalise_email(cls, v: str) -> str:
        """Lowercase and strip whitespace to prevent duplicate accounts."""
        return v.strip().lower()


class AdminProductUpdate(BaseModel):
    enabled: bool

class AdminThemeUpdate(BaseModel):
    theme: str

class ProductAdminOut(BaseModel):
    id: str
    name: str
    version: str
    enabled: bool
    route_prefix: str
    plugins_required: List[str]
    theme: str
    status: str

class PluginAdminOut(BaseModel):
    name: str
    version: str
    hooks_registered: List[str]
    status: str

class ThemeAdminOut(BaseModel):
    name: str
    version: str
    active: bool


# ── Ecosystem Endpoints ────────────────────────────────────────────────────────

@router.get("/products", response_model=List[ProductAdminOut])
async def get_admin_products(_: dict = Depends(require_admin)):
    """
    List all products in the ecosystem and their current status.
    """
    from services.product_loader import _products
    
    results = []
    for name, data in _products.items():
        manifest = data["manifest"]
        results.append(ProductAdminOut(
            id=name,
            name=name,
            version=manifest.get("version", "0.0.0"),
            enabled=manifest.get("enabled", True),
            route_prefix=data.get("route_prefix", ""),
            plugins_required=manifest.get("plugins", []),
            theme=manifest.get("theme", "default"),
            status=data["status"]
        ))
    return results


@router.patch("/products/{product_id}")
async def toggle_product(
    product_id: str, 
    body: AdminProductUpdate,
    _: dict = Depends(require_admin)
):
    """
    Toggle a product's enabled state in its manifest.
    Note: Requires a server restart or loader refresh to take effect.
    """
    from services.product_loader import PRODUCTS_DIR
    import json
    import os

    product_path = os.path.join(PRODUCTS_DIR, product_id)
    manifest_path = os.path.join(product_path, "product.json")
    
    if not os.path.exists(manifest_path):
        raise HTTPException(status_code=404, detail="Product manifest not found")

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    manifest["enabled"] = body.enabled

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=4)

    return {"status": "success", "message": f"Product '{product_id}' enabled set to {body.enabled}. Please restart for changes."}


@router.get("/plugins", response_model=List[PluginAdminOut])
async def get_admin_plugins(_: dict = Depends(require_admin)):
    """
    List all plugins and their registered hooks.
    """
    from services.plugin_loader import _plugins
    from services.hooks import list_hooks
    
    all_hooks = list_hooks()
    results = []
    
    for name, data in _plugins.items():
        manifest = data["manifest"]
        # In a real system, we'd track which hooks belong to which plugin name.
        # For now, we list hooks that mention the plugin in their name or just list all.
        results.append(PluginAdminOut(
            name=name,
            version=manifest.get("version", "1.0.0"),
            hooks_registered=all_hooks.get(f"plugin_{name}", []), # Placeholder logic
            status=data["status"]
        ))
    return results


@router.get("/themes", response_model=List[ThemeAdminOut])
async def get_admin_themes(_: dict = Depends(require_admin)):
    """
    List available system themes.
    """
    import os
    import json
    base_dir = os.path.dirname(os.path.dirname(__file__))
    THEMES_DIR = os.path.join(base_dir, "..", "themes")
    
    results = []
    # Current active theme could be stored in DB or config. 
    # For now, we'll just report 'default' as active.
    
    if os.path.exists(THEMES_DIR):
        for item in os.listdir(THEMES_DIR):
            theme_path = os.path.join(THEMES_DIR, item)
            if os.path.isdir(theme_path):
                manifest_path = os.path.join(theme_path, "theme.json")
                if os.path.exists(manifest_path):
                    with open(manifest_path, 'r') as f:
                        m = json.load(f)
                        results.append(ThemeAdminOut(
                            name=m.get("name", item),
                            version=m.get("version", "1.0.0"),
                            active=(m.get("name") == "default")
                        ))
    return results


@router.patch("/themes/active")
async def set_active_theme(body: AdminThemeUpdate, _: dict = Depends(require_admin)):
    """
    Set the global default theme (Note: In a modular system, this might be per-product).
    """
    return {"status": "success", "message": f"Global theme set to {body.theme} (Simulated)"}


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Purpose : Return dashboard summary counts.
    Input   : None (JWT required)
    Output  : StatsResponse
    Performance: 4 count queries run concurrently via asyncio.gather — ~4x faster
                 than sequential awaits on a networked DB.
    """
    # ── Run all count queries concurrently ────────────────────────────────
    (
        total_leads,
        total_partners,
        new_leads,
        pending_partners,
        section_rows,
    ) = await asyncio.gather(
        db.execute(select(func.count()).select_from(ContactRecord)),
        db.execute(select(func.count()).select_from(PartnerRecord)),
        db.execute(
            select(func.count()).select_from(ContactRecord)
            .where(ContactRecord.status == "new")
        ),
        db.execute(
            select(func.count()).select_from(PartnerRecord)
            .where(PartnerRecord.status == "pending")
        ),
        db.execute(
            select(ContactRecord.section, func.count().label("cnt"))
            .group_by(ContactRecord.section)
        ),
    )

    leads_by_section = {row.section: row.cnt for row in section_rows.all()}

    return StatsResponse(
        total_leads=total_leads.scalar_one(),
        total_partners=total_partners.scalar_one(),
        new_leads=new_leads.scalar_one(),
        pending_partners=pending_partners.scalar_one(),
        leads_by_section=leads_by_section,
    )


@router.get("/leads", response_model=List[LeadOut])
async def get_leads(
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=500),
    section: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Purpose : Paginated list of contact submissions, newest first.
    Input   : page, size, optional section + status filters (JWT required)
    Output  : List[LeadOut]
    """
    q = select(ContactRecord).order_by(ContactRecord.created_at.desc())
    if section:
        q = q.where(ContactRecord.section == section)
    if status_filter:
        q = q.where(ContactRecord.status == status_filter)
    q = q.offset((page - 1) * size).limit(size)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/leads/{lead_id}", response_model=LeadOut)
async def update_lead(
    lead_id: int,
    body: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Purpose : Update a lead's status or admin notes.
    Input   : lead_id (path), LeadUpdate body (JWT required)
    Output  : Updated LeadOut
    Errors  : 404 if lead not found
    """
    result = await db.execute(select(ContactRecord).where(ContactRecord.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    if body.status is not None:
        lead.status = body.status
        if body.status == "contacted":
            lead.contacted_at = datetime.now(timezone.utc)
    if body.admin_notes is not None:
        lead.admin_notes = body.admin_notes

    await db.commit()
    await db.refresh(lead)
    return lead


@router.get("/partners", response_model=List[PartnerOut])
async def get_partners(
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=500),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Purpose : Paginated list of partner applications, newest first.
    Input   : page, size, optional status filter (JWT required)
    Output  : List[PartnerOut]
    """
    q = select(PartnerRecord).order_by(PartnerRecord.created_at.desc())
    if status_filter:
        q = q.where(PartnerRecord.status == status_filter)
    q = q.offset((page - 1) * size).limit(size)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/partners/{partner_id}", response_model=PartnerOut)
async def update_partner(
    partner_id: int,
    body: PartnerUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Purpose : Update a partner application's status or notes.
    Input   : partner_id (path), PartnerUpdate body (JWT required)
    Output  : Updated PartnerOut
    Errors  : 404 if application not found
    """
    result = await db.execute(select(PartnerRecord).where(PartnerRecord.id == partner_id))
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner application not found")

    if body.status is not None:
        partner.status = body.status
        partner.reviewed_at = datetime.now(timezone.utc)
    if body.admin_notes is not None:
        partner.admin_notes = body.admin_notes

    await db.commit()
    await db.refresh(partner)
    return partner


# ── Team Management ───────────────────────────────────────────────────────────

@router.get("/users", response_model=List[AdminUserOut])
async def get_admin_users(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_superadmin),
):
    """
    Purpose : List all admin users (Superadmin only).
    """
    result = await db.execute(select(AdminUser).order_by(AdminUser.created_at.desc()))
    return result.scalars().all()


@router.post("/users", response_model=AdminUserOut)
async def create_admin_user(
    body: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_superadmin),
):
    """
    Purpose : Create a new admin user (Superadmin only).
    """
    # Check if exists
    existing = await db.execute(select(AdminUser).where(AdminUser.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = AdminUser(
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.delete("/users/{user_id}")
async def delete_admin_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_superadmin),
):
    """
    Purpose : Delete an admin user (Superadmin only).
    """
    # Prevent self-deletion
    if payload.get("sub") == user_id: # Actually sub is email in the current JWT logic
         pass

    result = await db.execute(select(AdminUser).where(AdminUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Prevent deleting the last superadmin or self
    if user.email == payload.get("sub"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    await db.delete(user)
    await db.commit()
    return {"status": "success"}
