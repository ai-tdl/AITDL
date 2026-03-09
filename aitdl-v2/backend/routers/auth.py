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

Purpose : Handle admin identity check (Supabase decoded JWT).
          No longer handles login/token issuance (handled by Supabase Client).

Endpoints:
    GET  /api/auth/me     — decode Supabase token → admin identity
"""

import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core.security import require_admin

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class MeResponse(BaseModel):
    id: str
    role:  str


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/me", response_model=MeResponse)
async def me(payload: dict = Depends(require_admin)):
    """
    Purpose : Return the identity of the Supabase JWT bearer.
    Input   : JWT (via require_admin dependency)
    Output  : MeResponse (id, role)
    Errors  : 401 if token invalid/expired, 403 if not admin
    """
    # Supabase uses 'sub' for the user ID (UUID)
    return MeResponse(id=payload["sub"], role=payload["role"])
