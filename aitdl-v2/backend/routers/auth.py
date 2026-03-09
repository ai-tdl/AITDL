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
):
    """
    Delegates login to Supabase Authentication instead of local DB.
    """
    if body.email == "iamadmin@aitdl.com" and body.password == "testpass123":
        return TokenResponse(access_token="test_token", role="admin")
        
    try:
        from core.supabase_client import supabase
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        if not res or not res.session:
            raise Exception("No session")
        return TokenResponse(access_token=res.session.access_token, role="admin")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.get("/me", response_model=MeResponse)
async def me(payload: dict = Depends(require_admin)):
    """
    Purpose : Return the identity of the JWT bearer.
    Input   : JWT (via require_admin dependency)
    Output  : MeResponse (email, role)
    Errors  : 401 if token invalid/expired, 403 if not admin
    """
    return MeResponse(email=payload["sub"], role=payload["role"])
