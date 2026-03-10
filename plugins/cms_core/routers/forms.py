# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Forms Router — plugins/cms-core/routers/forms.py

Endpoints:
    GET    /api/v1/cms/forms                              — list forms
    POST   /api/v1/cms/forms                              — create form
    GET    /api/v1/cms/forms/{id}/submissions             — list submissions
    GET    /api/v1/cms/forms/{id}/submissions?format=csv  — export CSV
"""

import sys, os, uuid, csv, io, hashlib, logging
from datetime import datetime, timezone
from typing import Optional, List

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend"))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services import hooks

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_cms_user, require_workspace_admin, get_current_workspace
from cms_core.models.cms_tables import CMSForm, CMSSubmission, Workspace, CMSAuditLog

log = logging.getLogger(__name__)
router = APIRouter(tags=["CMS — Forms"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class FormCreate(BaseModel):
    title:           str       = Field(..., min_length=1, max_length=300)
    slug:            str       = Field(..., min_length=1, max_length=255, pattern=r'^[a-z0-9/_-]+$')
    fields:          list      = Field(default_factory=list)
    notify_email:    Optional[str] = None
    success_message: str       = "Thank you! We will get back to you soon."
    enabled:         bool      = True

class FormOut(BaseModel):
    id: uuid.UUID; workspace_id: uuid.UUID; title: str; slug: str
    fields: list; notify_email: Optional[str]
    success_message: str; enabled: bool; honeypot_field: str
    created_at: datetime; updated_at: datetime
    class Config: from_attributes = True

class SubmissionOut(BaseModel):
    id: uuid.UUID; form_id: uuid.UUID; workspace_id: uuid.UUID
    data: dict; status: str; submitted_at: datetime
    class Config: from_attributes = True

class PublicSubmission(BaseModel):
    """Schema for public form submissions from the frontend."""
    data: dict = Field(..., description="Key-value pairs of submitted field values")
    honeypot: Optional[str] = Field(default=None, alias="_hp")


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_form_or_404(form_id: uuid.UUID, workspace_id: uuid.UUID, db: AsyncSession) -> CMSForm:
    result = await db.execute(
        select(CMSForm).where(CMSForm.id == form_id, CMSForm.workspace_id == workspace_id)
    )
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


# ── Admin Endpoints ────────────────────────────────────────────────────────────

@router.get("/forms", response_model=List[FormOut])
async def list_forms(
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """List all forms in the workspace."""
    result = await db.execute(
        select(CMSForm).where(CMSForm.workspace_id == workspace.id).order_by(CMSForm.created_at.desc())
    )
    return result.scalars().all()


@router.post("/forms", response_model=FormOut, status_code=status.HTTP_201_CREATED)
async def create_form(
    body: FormCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_workspace_admin),
):
    """Create a new form definition. Requires workspace_admin role."""
    exists = await db.execute(
        select(CMSForm).where(CMSForm.workspace_id == workspace.id, CMSForm.slug == body.slug)
    )
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Form slug '{body.slug}' already exists")

    actor = payload.get("sub", "unknown")
    form = CMSForm(
        id=uuid.uuid4(), workspace_id=workspace.id,
        title=body.title, slug=body.slug, fields=body.fields,
        notify_email=body.notify_email, success_message=body.success_message,
        enabled=body.enabled,
    )
    db.add(form)
    db.add(CMSAuditLog(
        id=uuid.uuid4(), workspace_id=workspace.id, actor_email=actor,
        action="created", resource_type="form", resource_id=str(form.id),
    ))
    await db.commit()
    await db.refresh(form)
    return form


@router.get("/forms/{form_id}/submissions")
async def list_submissions(
    form_id: uuid.UUID,
    request: Request,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_workspace_admin),
    format: Optional[str] = Query(default=None, description="Set to 'csv' for CSV export"),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
):
    """
    List form submissions. Returns JSON by default.
    Add ?format=csv to download as CSV for CRM import.
    """
    form = await _get_form_or_404(form_id, workspace.id, db)
    result = await db.execute(
        select(CMSSubmission)
        .where(CMSSubmission.form_id == form_id)
        .order_by(CMSSubmission.submitted_at.desc())
        .offset(offset).limit(limit)
    )
    submissions = result.scalars().all()

    if format == "csv":
        # Build CSV in memory
        output = io.StringIO()
        if submissions:
            all_keys = sorted(set(k for s in submissions for k in s.data.keys()))
            writer = csv.DictWriter(output, fieldnames=["id", "submitted_at", "status"] + all_keys)
            writer.writeheader()
            for sub in submissions:
                row = {"id": str(sub.id), "submitted_at": sub.submitted_at.isoformat(), "status": sub.status}
                row.update({k: sub.data.get(k, "") for k in all_keys})
                writer.writerow(row)

        csv_bytes = output.getvalue().encode("utf-8")
        filename = f"{form.slug}_submissions_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
        return StreamingResponse(
            iter([csv_bytes]),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    return [SubmissionOut.model_validate(s) for s in submissions]


# ── Public Submission Endpoint ────────────────────────────────────────────────

@router.post("/forms/{form_id}/submit", status_code=status.HTTP_201_CREATED)
async def submit_form(
    form_id: uuid.UUID,
    body: PublicSubmission,
    request: Request,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint — frontend submits form data here (no auth required).
    Anti-spam: honeypot check. Rate limiting handled by slowapi at the app level.
    IP is hashed (SHA-256) before storage — privacy-compliant.
    """
    form = await _get_form_or_404(form_id, workspace.id, db)
    if not form.enabled:
        raise HTTPException(status_code=400, detail="This form is not accepting submissions")

    # Honeypot check — bots fill the hidden field, humans don't
    if body.honeypot:
        log.warning(f"[cms] Honeypot triggered on form {form_id}")
        # Return success to not reveal the check
        return {"status": "ok"}

    # Hash IP for privacy
    client_ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()

    submission = CMSSubmission(
        id=uuid.uuid4(), form_id=form_id, workspace_id=workspace.id,
        data=body.data, ip_hash=ip_hash,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # Fire hook — email/WhatsApp plugins will respond
    await hooks.trigger(
        "on_form_submitted",
        form_id=form_id, workspace_id=workspace.id,
        submission_id=submission.id,
        notify_email=form.notify_email,
    )
    log.info(f"[cms] Form submission {submission.id} for form {form_id}")
    return {"status": "ok", "message": form.success_message}
