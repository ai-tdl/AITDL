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
Admin seed script — scripts/create_admin.py

Purpose : Create the AITDL super admin account in the database.
          Credentials are read from .env — NEVER hardcoded.
          Safe to run multiple times (upserts on email).

Usage   :
    1. Set in backend/.env:
           ADMIN_EMAIL=iamadmin@aitdl.com
           ADMIN_PASSWORD=yourpassword
    2. Run from aitdl-v2/ root:
           python scripts/create_admin.py

Input   : ADMIN_EMAIL, ADMIN_PASSWORD from environment (.env)
Output  : Prints confirmation — admin created or already exists
Errors  : Exits with code 1 if env vars are missing or DB is unreachable
"""

import asyncio
import os
import sys

# ── Resolve backend to sys.path ───────────────────────────────────────────────
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_root, "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(_root, "backend", ".env"))

from sqlalchemy import select
from core.database import AsyncSessionLocal, engine, Base
from core.security import hash_password
from core.config import settings
from models.db_tables import AdminUser


async def create_superadmin() -> None:
    """
    Purpose : Upsert the superadmin user from env vars into the admins table.
    Input   : ADMIN_EMAIL, ADMIN_PASSWORD from .env
    Output  : None (prints result to stdout)
    Errors  : sys.exit(1) on missing env vars or DB failure
    """
    email    = settings.ADMIN_EMAIL.strip()
    password = settings.ADMIN_PASSWORD.strip()

    if not email or not password:
        print("[ERROR] ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env")
        sys.exit(1)

    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        result = await db.execute(select(AdminUser).where(AdminUser.email == email))
        existing = result.scalar_one_or_none()

        if existing:
            # Update password hash (safe re-run)
            existing.password_hash = hash_password(password)
            existing.role = "superadmin"
            await db.commit()
            print(f"[AITDL] Super admin updated: {email}")
        else:
            admin = AdminUser(
                email=email,
                password_hash=hash_password(password),
                role="superadmin",
            )
            db.add(admin)
            await db.commit()
            print(f"[AITDL] Super admin created: {email}")

    print("[AITDL] Done. || ॐ श्री गणेशाय नमः ||")


if __name__ == "__main__":
    asyncio.run(create_superadmin())
