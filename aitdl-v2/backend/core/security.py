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

Purpose : Password hashing (bcrypt), JWT creation and verification,
          and the FastAPI `require_admin` dependency for protected routes.

Input   : Plain passwords, tokens, JWT settings from config
Output  : Hashed passwords, signed JWTs, decoded payloads, HTTPException on failure
Errors  : 401 for bad credentials, 403 for missing/invalid token
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import settings


# ── Password hashing ───────────────────────────────────────────────────────────

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """
    Purpose : Hash a plain-text password using bcrypt.
    Input   : plain — raw password string
    Output  : hashed string safe to store in DB
    Errors  : None
    """
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Purpose : Compare a plain password against a stored bcrypt hash.
    Input   : plain — raw input, hashed — value from DB
    Output  : True if match, False otherwise
    Errors  : None (passlib handles internally)
    """
    return _pwd_context.verify(plain, hashed)


# ── JWT ────────────────────────────────────────────────────────────────────────

def create_jwt(data: dict, expires_hours: Optional[int] = None) -> str:
    """
    Purpose : Create a signed JWT with an expiry claim.
    Input   : data — dict to encode (e.g. {"sub": email, "role": "superadmin"})
              expires_hours — override default from settings
    Output  : Signed JWT string
    Errors  : None
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        hours=expires_hours or settings.JWT_EXPIRE_HOURS
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_jwt(token: str) -> dict:
    """
    Purpose : Decode and validate a JWT.
    Input   : token — raw JWT string (no 'Bearer ' prefix)
    Output  : Decoded payload dict
    Errors  : Raises HTTP 401 if expired or invalid
    """
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── FastAPI dependency ─────────────────────────────────────────────────────────

_bearer = HTTPBearer()


def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    Purpose : FastAPI dependency — validates JWT and returns payload.
    Input   : Authorization: Bearer <token>
    Output  : Dict with 'sub' (email) and 'role'
    Errors  : 401 Unauthorized, 403 Forbidden for bad roles
    """
    token = credentials.credentials
    payload = decode_jwt(token)
    
    role = payload.get("role")
    if role not in ("superadmin", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
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
