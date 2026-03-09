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
Security utilities — backend/core/security.py

Purpose : Decodes and verifies Supabase-issued JWTs for protected routes.
          Provides FastAPI dependencies (require_admin, require_superadmin).
Input   : Supabase Bearer token
Output  : Decoded payload dict, user roles extracted from app_metadata
Errors  : 401 Unauthorized for bad tokens, 403 Forbidden for insufficient roles
"""

from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import settings

# ── JWT Verification ──────────────────────────────────────────────────────────

def decode_jwt(token: str) -> dict:
    """
    Purpose : Decode and validate a Supabase-issued JWT locally using the JWT Secret.
    Input   : token — raw JWT string (no 'Bearer ' prefix)
    Output  : Decoded payload dict
    Errors  : Raises HTTP 401 if expired or invalid
    """
    try:
        # Supabase defaults to HS256 for local signing with the JWT secret.
        # Ensure the audience is set to 'authenticated' if enforcing aud claims,
        # but for Phase 4 we decode using the project's secret key.
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False} # Supabase aud is usually 'authenticated'
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ── FastAPI dependencies ──────────────────────────────────────────────────────

_bearer = HTTPBearer()

def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    Purpose : FastAPI dependency — validates Supabase JWT and ensures admin role.
    Input   : Authorization: Bearer <token>
    Output  : Dict with 'sub' (user UUID) and 'role'
    Errors  : 401 Unauthorized, 403 Forbidden for bad roles
    """
    token = credentials.credentials
    payload = decode_jwt(token)
    
    # In Supabase, custom roles are typically stored in app_metadata
    # e.g., payload.get('app_metadata', {}).get('role')
    app_metadata = payload.get("app_metadata", {})
    role = app_metadata.get("role")
    
    # If not using Supabase app_metadata, fallback to standard role claim for testing
    if not role:
        role = payload.get("role")

    if role not in ("superadmin", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    # Attach unified role back to payload for convenience
    payload['role'] = role
    return payload


def require_superadmin(
    payload: dict = Depends(require_admin),
) -> dict:
    """
    Purpose : FastAPI dependency — ensures the admin has 'superadmin' role.
    Input   : Decoded JWT payload (from require_admin)
    Output  : Decoded payload
    Errors  : 403 Forbidden if not superadmin
    """
    if payload.get("role") != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required",
        )
    return payload
