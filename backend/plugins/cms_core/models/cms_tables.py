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
# Now: 9 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS SQLAlchemy ORM Models — plugins/cms-core/models/cms_tables.py

Purpose : Define SQLAlchemy ORM mappings for all CMS database tables.
          Follows the exact pattern established in backend/models/db_tables.py.
          These models share the same Base as the rest of the application,
          so they are auto-discovered by create_all() in test fixtures.

Tables  : Workspace, Page, Block, Card, MediaAsset, BlogPost, CMSForm,
          CMSSubmission, ContentVersion, CMSAuditLog, CMSPrompt

Input   : None (imported by routers and test fixtures)
Output  : ORM-mapped classes
Errors  : Raises SQLAlchemy errors on misconfiguration
"""

import sys
import os

# Resolve backend path so we can import from core.database
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Boolean, Integer, DateTime, func, Index, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base  # shared Base — same metadata as rest of app


# ── Workspace ──────────────────────────────────────────────────────────────────

class Workspace(Base):
    """
    One record per CMS tenant (AITDL internal or client).

    Fields:
        id               : UUID primary key
        name             : Display name ('AITDL Internal', 'Sharma Retail')
        slug             : URL-safe unique identifier
        plan             : 'internal' | 'starter' | 'pro' | 'business'
        ai_credits_used  : Count of AI credits consumed this period
        ai_credits_limit : Cap (-1 = unlimited for internal)
        is_active        : Soft-disable without deletion
    """
    __tablename__ = "workspaces"

    id:               Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name:             Mapped[str]      = mapped_column(Text, nullable=False)
    slug:             Mapped[str]      = mapped_column(String(120), nullable=False, unique=True)
    plan:             Mapped[str]      = mapped_column(String(30), nullable=False, default="internal")
    ai_credits_used:  Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    ai_credits_limit: Mapped[int]      = mapped_column(Integer, nullable=False, default=1000)
    is_active:        Mapped[bool]     = mapped_column(Boolean, nullable=False, default=True)
    created_at:       Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:       Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── Page ───────────────────────────────────────────────────────────────────────

class Page(Base):
    """
    A full page record. Contains metadata only — content lives in Block records.

    Fields:
        slug             : URL path (/about, /products) — unique per workspace
        status           : draft | published | archived
        template         : landing | blog | product | custom
        last_modified_by : Email of last editor (used for optimistic lock check)
    """
    __tablename__ = "pages"
    __table_args__ = (
        Index("uq_pages_workspace_slug", "workspace_id", "slug", unique=True),
    )

    id:               Mapped[uuid.UUID]           = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id:     Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    title:            Mapped[str]           = mapped_column(Text, nullable=False)
    slug:             Mapped[str]           = mapped_column(String(255), nullable=False)
    status:           Mapped[str]           = mapped_column(String(30), nullable=False, default="draft")
    template:         Mapped[str]           = mapped_column(String(50), nullable=False, default="custom")
    seo_title:        Mapped[str] = mapped_column(Text, nullable=True)
    seo_description:  Mapped[str] = mapped_column(Text, nullable=True)
    last_modified_by: Mapped[str] = mapped_column(String(200), nullable=True)
    published_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by:       Mapped[str] = mapped_column(String(200), nullable=True)
    created_at:       Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:       Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── Block ──────────────────────────────────────────────────────────────────────

class Block(Base):
    """
    A single page builder block. Config is JSONB — each block type defines its own shape.

    Block types: hero | cards | blog_preview | text | media | cta_banner | form | stats
    """
    __tablename__ = "blocks"

    id:           Mapped[uuid.UUID]      = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    page_id:      Mapped[uuid.UUID]      = mapped_column(Uuid, nullable=False)
    type:         Mapped[str]      = mapped_column(String(50), nullable=False)
    sort_order:   Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    config:       Mapped[dict]     = mapped_column(JSON, nullable=False, default=dict)
    ai_generated: Mapped[bool]     = mapped_column(Boolean, nullable=False, default=False)
    created_at:   Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:   Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── Card ───────────────────────────────────────────────────────────────────────

class Card(Base):
    """
    Reusable card unit used across AITDL frontends (gate doors, overview grid, product cards).
    Max 2 levels: root card (parent_id=None) → sub-cards.
    """
    __tablename__ = "cards"

    id:           Mapped[uuid.UUID]      = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID]      = mapped_column(Uuid, nullable=False)
    parent_id:    Mapped[uuid.UUID] = mapped_column(Uuid, nullable=True)
    title:        Mapped[str]           = mapped_column(Text, nullable=False)
    description:  Mapped[str] = mapped_column(Text, nullable=True)
    icon:         Mapped[str] = mapped_column(String(50), nullable=True)
    badge:        Mapped[str] = mapped_column(String(50), nullable=True)
    cta_text:     Mapped[str] = mapped_column(String(100), nullable=True)
    cta_url:      Mapped[str] = mapped_column(Text, nullable=True)
    sort_order:   Mapped[int]           = mapped_column(Integer, nullable=False, default=0)
    enabled:      Mapped[bool]          = mapped_column(Boolean, nullable=False, default=True)
    tags:         Mapped[list]          = mapped_column(JSON, nullable=False, default=list)
    created_at:   Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:   Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── MediaAsset ─────────────────────────────────────────────────────────────────

class MediaAsset(Base):
    """
    Uploaded file record. Points to Supabase Storage via storage_path.
    cdn_url abstracts the storage backend — switch from Supabase to S3 by changing this field only.
    """
    __tablename__ = "media_assets"

    id:           Mapped[uuid.UUID]           = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    filename:     Mapped[str]           = mapped_column(Text, nullable=False)
    storage_path: Mapped[str]           = mapped_column(Text, nullable=False)
    cdn_url:      Mapped[str] = mapped_column(Text, nullable=True)
    mime_type:    Mapped[str]           = mapped_column(String(100), nullable=False, default="application/octet-stream")
    size_bytes:   Mapped[int]           = mapped_column(Integer, nullable=False, default=0)
    alt_text:     Mapped[str] = mapped_column(Text, nullable=True)
    uploaded_by:  Mapped[str] = mapped_column(String(200), nullable=True)
    created_at:   Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:   Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── BlogPost ──────────────────────────────────────────────────────────────────

class BlogPost(Base):
    """
    Blog post with rich text stored as structured JSONB (Portable Text nodes).
    Safe, queryable, translatable — no raw HTML.
    Status flow: draft → review → published (configurable per workspace).
    """
    __tablename__ = "blog_posts"
    __table_args__ = (
        Index("uq_blog_workspace_slug", "workspace_id", "slug", unique=True),
    )

    id:               Mapped[uuid.UUID]      = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id:     Mapped[uuid.UUID]      = mapped_column(Uuid, nullable=False)
    title:            Mapped[str]           = mapped_column(Text, nullable=False)
    slug:             Mapped[str]           = mapped_column(String(255), nullable=False)
    content:          Mapped[list]          = mapped_column(JSON, nullable=False, default=list)
    author_id:        Mapped[str] = mapped_column(String(200), nullable=True)
    status:           Mapped[str]           = mapped_column(String(30), nullable=False, default="draft")
    featured_image:   Mapped[uuid.UUID] = mapped_column(Uuid, nullable=True)
    ai_summary:       Mapped[str] = mapped_column(Text, nullable=True)
    tags:             Mapped[list]          = mapped_column(JSON, nullable=False, default=list)
    seo_title:        Mapped[str] = mapped_column(Text, nullable=True)
    seo_description:  Mapped[str] = mapped_column(Text, nullable=True)
    last_modified_by: Mapped[str] = mapped_column(String(200), nullable=True)
    published_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at:       Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:       Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── CMSForm ───────────────────────────────────────────────────────────────────

class CMSForm(Base):
    """
    Dynamic form definition. Fields are stored as JSONB — each element is a
    field config dict: {type, name, label, required, options, validation}.
    Field types: text, email, tel, select, textarea, checkbox, radio, file, hidden.
    """
    __tablename__ = "cms_forms"
    __table_args__ = (
        Index("uq_forms_workspace_slug", "workspace_id", "slug", unique=True),
    )

    id:              Mapped[uuid.UUID]           = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id:    Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    title:           Mapped[str]           = mapped_column(Text, nullable=False)
    slug:            Mapped[str]           = mapped_column(String(255), nullable=False)
    fields:          Mapped[list]          = mapped_column(JSON, nullable=False, default=list)
    notify_email:    Mapped[str] = mapped_column(String(200), nullable=True)
    success_message: Mapped[str]           = mapped_column(Text, nullable=False, default="Thank you! We will get back to you soon.")
    enabled:         Mapped[bool]          = mapped_column(Boolean, nullable=False, default=True)
    honeypot_field:  Mapped[str]           = mapped_column(String(50), nullable=False, default="_hp")
    created_at:      Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:      Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── CMSSubmission ─────────────────────────────────────────────────────────────

class CMSSubmission(Base):
    """
    A single form submission. Stored even if email notification fails — no data loss.
    ip_hash is SHA-256 of the submitter's IP address (privacy-compliant).
    """
    __tablename__ = "cms_submissions"

    id:           Mapped[uuid.UUID]           = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    form_id:      Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    workspace_id: Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    data:         Mapped[dict]          = mapped_column(JSON, nullable=False, default=dict)
    status:       Mapped[str]           = mapped_column(String(30), nullable=False, default="new")
    ip_hash:      Mapped[str] = mapped_column(String(64), nullable=True)
    submitted_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at:   Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at:   Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── ContentVersion ─────────────────────────────────────────────────────────────

class ContentVersion(Base):
    """
    Snapshot of a page or blog_post before a save/publish action.
    Enables rollback to any previous version.
    """
    __tablename__ = "content_versions"

    id:            Mapped[uuid.UUID]           = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id:  Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    resource_type: Mapped[str]           = mapped_column(String(30), nullable=False)  # 'page' | 'blog_post'
    resource_id:   Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    version_num:   Mapped[int]           = mapped_column(Integer, nullable=False, default=1)
    snapshot:      Mapped[dict]          = mapped_column(JSON, nullable=False, default=dict)
    saved_by:      Mapped[str] = mapped_column(String(200), nullable=True)
    created_at:    Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── CMSAuditLog ───────────────────────────────────────────────────────────────

class CMSAuditLog(Base):
    """
    Immutable audit trail of every mutating CMS action.
    Append-only — application code must never UPDATE or DELETE rows here.
    """
    __tablename__ = "cms_audit_log"

    id:            Mapped[uuid.UUID]           = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id:  Mapped[uuid.UUID]           = mapped_column(Uuid, nullable=False)
    actor_email:   Mapped[str]           = mapped_column(String(200), nullable=False)
    action:        Mapped[str]           = mapped_column(String(30), nullable=False)  # created|updated|deleted|published
    resource_type: Mapped[str]           = mapped_column(String(50), nullable=False)
    resource_id:   Mapped[str]           = mapped_column(Text, nullable=False)
    diff:          Mapped[dict] = mapped_column(JSON, nullable=True)
    ip_hash:       Mapped[str] = mapped_column(String(64), nullable=True)
    created_at:    Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ── CMSPrompt ─────────────────────────────────────────────────────────────────

class CMSPrompt(Base):
    """
    Versioned AI system prompts. Only one prompt per task_type should have is_active=True.
    Queried at runtime — no code deploy needed to update prompts.
    """
    __tablename__ = "cms_prompts"

    id:            Mapped[uuid.UUID]           = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    task_type:     Mapped[str]           = mapped_column(String(50), nullable=False)  # generate|improve|translate|seo|alt_text
    version:       Mapped[int]           = mapped_column(Integer, nullable=False, default=1)
    is_active:     Mapped[bool]          = mapped_column(Boolean, nullable=False, default=True)
    system_prompt: Mapped[str]           = mapped_column(Text, nullable=False)
    notes:         Mapped[str] = mapped_column(Text, nullable=True)
    created_by:    Mapped[str] = mapped_column(String(200), nullable=True)
    created_at:    Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
