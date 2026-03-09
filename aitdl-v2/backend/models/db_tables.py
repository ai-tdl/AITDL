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
SQLAlchemy ORM table definitions — models/db_tables.py

Purpose : Define database table mappings for contacts, partner_applications,
          and admins. These are ORM models (SQLAlchemy). Pydantic models stay
          in contact.py / partner.py for API validation.

Input   : None (imported by routers and scripts)
Output  : ContactRecord, PartnerRecord, AdminUser — mapped classes
Errors  : Raises SQLAlchemy errors on misconfiguration
"""

from datetime import datetime
from sqlalchemy import String, Text, DateTime, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


# ── Contacts Table ─────────────────────────────────────────────────────────────

class ContactRecord(Base):
    """
    ORM model for the `contacts` table.

    Fields:
        id          : Auto-increment primary key
        name        : Submitter's full name
        phone       : Validated 10-digit phone (digits only)
        section     : Audience section that triggered the form
        business    : Business name (optional)
        city        : City (optional)
        message     : Free-text message (optional)
        status      : Workflow status — new | contacted | follow_up | closed
        admin_notes : Internal notes by admin
        contacted_at: When admin made contact
        created_at  : UTC timestamp auto-set on insert
    """
    __tablename__ = "contacts"

    id:           Mapped[int]               = mapped_column(primary_key=True, autoincrement=True)
    name:         Mapped[str]               = mapped_column(String(120), nullable=False)
    email:        Mapped[str]               = mapped_column(String(200), nullable=False, default="")
    phone:        Mapped[str]               = mapped_column(String(20),  nullable=False)
    section:      Mapped[str]               = mapped_column(String(60),  nullable=False)
    business:     Mapped[str]               = mapped_column(String(120), nullable=False, default="")
    city:         Mapped[str]               = mapped_column(String(80),  nullable=False, default="")
    message:      Mapped[str]               = mapped_column(Text,         nullable=False, default="")
    status:       Mapped[str]               = mapped_column(String(30),  nullable=False, default="new")
    admin_notes:  Mapped[str]               = mapped_column(Text,         nullable=False, default="")
    contacted_at: Mapped[datetime]          = mapped_column(DateTime(timezone=True), nullable=True)
    created_at:   Mapped[datetime]          = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


# ── Partner Applications Table ─────────────────────────────────────────────────

class PartnerRecord(Base):
    """
    ORM model for the `partner_applications` table.

    Fields:
        id          : Auto-increment primary key
        name        : Applicant's full name
        phone       : Validated 10-digit phone
        city        : City / territory of operation
        occupation  : Current role / profession (optional)
        message     : Why they want to partner (optional)
        status      : Workflow status — pending | approved | rejected | on_hold
        admin_notes : Internal notes by admin
        reviewed_at : When admin reviewed the application
        created_at  : UTC timestamp auto-set on insert
    """
    __tablename__ = "partner_applications"

    id:          Mapped[int]               = mapped_column(primary_key=True, autoincrement=True)
    name:        Mapped[str]               = mapped_column(String(120), nullable=False)
    email:       Mapped[str]               = mapped_column(String(200), nullable=False, default="")
    phone:       Mapped[str]               = mapped_column(String(20),  nullable=False)
    city:        Mapped[str]               = mapped_column(String(80),  nullable=False)
    occupation:  Mapped[str]               = mapped_column(String(120), nullable=False, default="")
    message:     Mapped[str]               = mapped_column(Text,         nullable=False, default="")
    status:      Mapped[str]               = mapped_column(String(30),  nullable=False, default="pending")
    admin_notes: Mapped[str]               = mapped_column(Text,         nullable=False, default="")
    reviewed_at: Mapped[datetime]          = mapped_column(DateTime(timezone=True), nullable=True)
    created_at:  Mapped[datetime]          = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


# ── Admins Table ───────────────────────────────────────────────────────────────

class AdminUser(Base):
    """
    ORM model for the `admins` table.

    Fields:
        id            : Auto-increment primary key
        email         : Unique admin email address
        password_hash : bcrypt hash — never store plain text
        role          : 'superadmin' or 'admin'
        is_active     : Soft-disable accounts without deletion
        last_login    : Updated on successful login
        created_at    : UTC timestamp auto-set on insert
    """
    __tablename__ = "admins"

    id:            Mapped[int]               = mapped_column(primary_key=True, autoincrement=True)
    email:         Mapped[str]               = mapped_column(String(200), nullable=False, unique=True)
    password_hash: Mapped[str]               = mapped_column(String(200), nullable=False)
    role:          Mapped[str]               = mapped_column(String(30),  nullable=False, default="admin")
    is_active:     Mapped[bool]              = mapped_column(Boolean,     nullable=False, default=True)
    last_login:    Mapped[datetime]          = mapped_column(DateTime(timezone=True), nullable=True)
    created_at:    Mapped[datetime]          = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

