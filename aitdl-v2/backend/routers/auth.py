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
Auth router — backend/routers/auth.py

Purpose : Handle admin authentication — login, token refresh, identity check.
          Issues JWT on valid credentials. Stateless — no server-side sessions.

Endpoints:
    POST /api/auth/login  — email + password → JWT
    GET  /api/auth/me     — decode token → admin identity
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import verify_password, create_jwt, require_admin
from models.db_tables import AdminUser

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    role:         str


class MeResponse(BaseModel):
    email: str
    role:  str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Purpose : Validate credentials and issue a signed JWT.
    Input   : LoginRequest (email, password)
    Output  : TokenResponse (access_token, token_type, role)
    Errors  : 401 if email not found, password wrong, or account inactive
    """
    result = await db.execute(select(AdminUser).where(AdminUser.email == body.email))
    admin = result.scalar_one_or_none()

    if not admin or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Update last_login
    admin.last_login = datetime.now(timezone.utc)
    await db.commit()

    token = create_jwt({"sub": admin.email, "role": admin.role})
    return TokenResponse(access_token=token, role=admin.role)


@router.get("/me", response_model=MeResponse)
async def me(payload: dict = Depends(require_admin)):
    """
    Purpose : Return the identity of the JWT bearer.
    Input   : JWT (via require_admin dependency)
    Output  : MeResponse (email, role)
    Errors  : 401 if token invalid/expired, 403 if not admin
    """
    return MeResponse(email=payload["sub"], role=payload["role"])
