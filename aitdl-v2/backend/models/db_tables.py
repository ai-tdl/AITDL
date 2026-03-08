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

Purpose : Define database table mappings for contacts and partner_applications.
          These are ORM models (SQLAlchemy). Pydantic models stay in contact.py
          and partner.py for API validation. Both live in models/ but serve
          different layers — this file owns the DB schema.

Input   : None (imported by routers)
Output  : ContactRecord, PartnerRecord — mapped classes ready for DB session use
Errors  : Raises SQLAlchemy errors on misconfiguration (e.g. bad column types)
"""

from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


# ── Contacts Table ─────────────────────────────────────────────────────────────

class ContactRecord(Base):
    """
    ORM model for the `contacts` table.

    Fields:
        id        : Auto-increment primary key
        name      : Submitter's full name
        phone     : Validated 10-digit phone (digits only, stored as str)
        section   : Audience section that triggered the form (e.g. 'retail')
        business  : Business name (optional)
        city      : City (optional)
        message   : Free-text message (optional)
        created_at: UTC timestamp auto-set on insert
    """
    __tablename__ = "contacts"

    id:         Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    name:       Mapped[str]      = mapped_column(String(120), nullable=False)
    phone:      Mapped[str]      = mapped_column(String(20),  nullable=False)
    section:    Mapped[str]      = mapped_column(String(60),  nullable=False)
    business:   Mapped[str]      = mapped_column(String(120), nullable=False, default="")
    city:       Mapped[str]      = mapped_column(String(80),  nullable=False, default="")
    message:    Mapped[str]      = mapped_column(Text,         nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


# ── Partner Applications Table ─────────────────────────────────────────────────

class PartnerRecord(Base):
    """
    ORM model for the `partner_applications` table.

    Fields:
        id         : Auto-increment primary key
        name       : Applicant's full name
        phone      : Validated 10-digit phone
        city       : City / territory of operation
        occupation : Current role / profession (optional)
        message    : Why they want to partner (optional)
        created_at : UTC timestamp auto-set on insert
    """
    __tablename__ = "partner_applications"

    id:         Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    name:       Mapped[str]      = mapped_column(String(120), nullable=False)
    phone:      Mapped[str]      = mapped_column(String(20),  nullable=False)
    city:       Mapped[str]      = mapped_column(String(80),  nullable=False)
    occupation: Mapped[str]      = mapped_column(String(120), nullable=False, default="")
    message:    Mapped[str]      = mapped_column(Text,         nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
