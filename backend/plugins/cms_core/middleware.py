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
CMS Auth Middleware — plugins/cms-core/middleware.py

Purpose : FastAPI dependency functions for CMS route protection.
          Reuses the existing JWT infrastructure from core/security.py —
          no new auth system, no new tokens.

Dependencies:
    require_cms_user          — any valid JWT; returns payload
    require_workspace_admin   — JWT with role superadmin | admin | workspace_admin
    get_workspace_id          — extracts workspace_id from JWT payload
    get_current_workspace     — resolves Workspace ORM record from workspace_id

JWT payload shape expected (set at login time):
    {
        "sub": "editor@example.com",
        "role": "admin",                      # existing role field
        "workspace_id": "aitdl"               # new field (Phase 2: set per-client at login)
    }

Phase 1: All AITDL admins log in via /api/auth/login and get workspace_id = 'aitdl'
         (internal). Client-specific workspace JWTs are a Phase 2 addition.

Input   : FastAPI Request (via HTTPBearer)
Output  : payload dict | workspace_id str | Workspace ORM object
Errors  : 401 if no/invalid JWT, 403 if insufficient role, 404 if workspace not found
"""

import sys
import os
import uuid
import logging
from typing import Optional

log = logging.getLogger(__name__)

# Resolve backend path
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.security import decode_jwt
from core.database import get_db

# Import CMS ORM models (from this plugin's own models dir)
_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.models.cms_tables import Workspace  # noqa: E402

_bearer = HTTPBearer()
_bearer_optional = HTTPBearer(auto_error=False)

# Roles that are allowed to manage CMS content at any level
_CMS_ALLOWED_ROLES = {"superadmin", "admin", "workspace_admin", "workspace_editor"}
_CMS_ADMIN_ROLES   = {"superadmin", "admin", "workspace_admin"}


# ── Core dependencies ──────────────────────────────────────────────────────────

def require_cms_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    Validate a JWT and return the payload.
    Any role is accepted — just requires a valid, non-expired token.

    Returns:
        payload dict with at minimum 'sub', 'role', optionally 'workspace_id'
    Raises:
        401 if token is missing or invalid
    """
    token = credentials.credentials
    payload = decode_jwt(token)
    return payload


def require_cms_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_optional),
) -> Optional[dict]:
    """
    Optional JWT validation. Returns None if no token provided.
    """
    if not credentials:
        return None
    try:
        return decode_jwt(credentials.credentials)
    except:
        return None


def require_workspace_admin(
    payload: dict = Depends(require_cms_user),
) -> dict:
    """
    Requires the JWT role to be one of: superadmin, admin, workspace_admin.
    Editors (workspace_editor) cannot perform destructive or config operations.

    Returns:
        payload dict
    Raises:
        403 if role is not in _CMS_ADMIN_ROLES
    """
    role = payload.get("role", "")
    if role not in _CMS_ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CMS admin role required (superadmin | admin | workspace_admin)"
        )
    return payload


def get_workspace_id(
    payload: Optional[dict] = Depends(require_cms_user_optional),
) -> str:
    """
    Extract workspace_id from the JWT payload OR use a default for public access.

    Returns:
        workspace_id string
    """
    if not payload:
        # Public request: default to 'aitdl-internal' for now (where our bhasha content is)
        return "aitdl-internal"

    workspace_id = payload.get("workspace_id")
    if not workspace_id:
        # Phase 1 fallback: superadmins/admins use the internal workspace
        role = payload.get("role", "")
        if role in ("superadmin", "admin"):
            return "aitdl"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No workspace_id in token and not an admin."
        )
    return workspace_id


async def get_current_workspace(
    workspace_id: str = Depends(get_workspace_id),
    db: AsyncSession = Depends(get_db),
) -> Workspace:
    """
    Resolve the workspace_id to a Workspace ORM record.
    Attempts lookup by ID (UUID) first if valid, then falls back to slug.
    """
    # 1. Try ID lookup if it looks like a UUID
    try:
        uid = uuid.UUID(workspace_id)
        result = await db.execute(select(Workspace).where(Workspace.id == uid))
        workspace = result.scalar_one_or_none()
        if workspace: return _check_active(workspace, workspace_id)
    except (ValueError, TypeError):
        pass

    # 2. Fallback to slug lookup
    result = await db.execute(select(Workspace).where(Workspace.slug == workspace_id))
    workspace = result.scalar_one_or_none()

    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace '{workspace_id}' not found"
        )
    return _check_active(workspace, workspace_id)

def _check_active(workspace: Workspace, workspace_id: str) -> Workspace:
    if not workspace.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Workspace '{workspace_id}' is inactive"
        )
    return workspace
