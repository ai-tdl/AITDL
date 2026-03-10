# || ॐ श्री गणेशाय नमः ||
# Organization: AITDL · Creator: Jawahar R. Mallah
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

import logging
import httpx
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from core.config import settings
from core.security import decode_jwt, require_admin

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    workspace_id: str
    expires_in: int

class RefreshRequest(BaseModel):
    refresh_token: str

class MeResponse(BaseModel):
    sub: str
    role: str
    workspace_id: Optional[str]
    exp: int

# ── Helpers ────────────────────────────────────────────────────────────────────

def extract_token_claims(access_token: str) -> dict:
    """
    Extracts and normalizes role and workspace_id from Supabase JWT.
    """
    payload = decode_jwt(access_token)
    app_metadata = payload.get("app_metadata", {})
    
    role = app_metadata.get("role") or payload.get("role", "user")
    workspace_id = app_metadata.get("workspace_id") or payload.get("workspace_id")
    
    # Platform Global Admin Fallback
    if not workspace_id and role in ("admin", "superadmin"):
        workspace_id = "aitdl"
    else:
        workspace_id = workspace_id or "default"
        
    return {
        "role": role,
        "workspace_id": workspace_id,
        "sub": payload.get("sub"),
        "exp": payload.get("exp")
    }

# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password",
                headers={"apikey": settings.SUPABASE_ANON_KEY},
                json={"email": body.email, "password": body.password}
            )
        
        if r.status_code != 200:
            log.warning(f"Login failed for {body.email}: {r.text}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        data = r.json()
        claims = extract_token_claims(data["access_token"])

        return LoginResponse(
            access_token=data["access_token"],
            refresh_token=data["refresh_token"],
            role=claims["role"],
            workspace_id=claims["workspace_id"],
            expires_in=data["expires_in"]
        )
    except httpx.RequestError as exc:
        log.error(f"Supabase connection error: {exc}")
        raise HTTPException(status_code=503, detail="Authentication service unavailable")

@router.post("/logout")
async def logout(payload: dict = Depends(require_admin)):
    return {"message": "Logged out"}  # Supabase token invalidation is client-side

@router.post("/refresh", response_model=LoginResponse)
async def refresh(body: RefreshRequest):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=refresh_token",
                headers={"apikey": settings.SUPABASE_ANON_KEY},
                json={"refresh_token": body.refresh_token}
            )
        
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        data = r.json()
        claims = extract_token_claims(data["access_token"])

        return LoginResponse(
            access_token=data["access_token"],
            refresh_token=data["refresh_token"],
            role=claims["role"],
            workspace_id=claims["workspace_id"],
            expires_in=data["expires_in"]
        )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")

@router.get("/me", response_model=MeResponse)
async def get_me(payload: dict = Depends(require_admin)):
    """
    Purpose : Return current user identities from JWT.
    """
    return MeResponse(
        sub=payload["sub"],
        role=payload.get("role", "user"),
        workspace_id=payload.get("workspace_id", "aitdl"),
        exp=payload["exp"]
    )
