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
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import require_admin, require_superadmin, hash_password
from models.db_tables import ContactRecord, PartnerRecord, AdminUser

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class LeadOut(BaseModel):
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

    class Config:
        from_attributes = True


class PartnerOut(BaseModel):
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

    class Config:
        from_attributes = True


class LeadUpdate(BaseModel):
    status:      Optional[str] = None   # new | contacted | follow_up | closed
    admin_notes: Optional[str] = None


class PartnerUpdate(BaseModel):
    status:      Optional[str] = None   # pending | approved | rejected | on_hold
    admin_notes: Optional[str] = None


class StatsResponse(BaseModel):
    total_leads:    int
    total_partners: int
    new_leads:      int
    pending_partners: int
    leads_by_section: dict


class AdminUserOut(BaseModel):
    id:         int
    email:      str
    role:       str
    is_active:  bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserCreate(BaseModel):
    email:    str
    password: str
    role:     str = "admin"


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
    """
    total_leads    = (await db.execute(select(func.count()).select_from(ContactRecord))).scalar_one()
    total_partners = (await db.execute(select(func.count()).select_from(PartnerRecord))).scalar_one()
    new_leads      = (await db.execute(
        select(func.count()).select_from(ContactRecord).where(ContactRecord.status == "new")
    )).scalar_one()
    pending_partners = (await db.execute(
        select(func.count()).select_from(PartnerRecord).where(PartnerRecord.status == "pending")
    )).scalar_one()

    # Leads by section
    rows = (await db.execute(
        select(ContactRecord.section, func.count().label("cnt"))
        .group_by(ContactRecord.section)
    )).all()
    leads_by_section = {row.section: row.cnt for row in rows}

    return StatsResponse(
        total_leads=total_leads,
        total_partners=total_partners,
        new_leads=new_leads,
        pending_partners=pending_partners,
        leads_by_section=leads_by_section,
    )


@router.get("/leads", response_model=List[LeadOut])
async def get_leads(
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
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
    size: int = Query(25, ge=1, le=100),
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
