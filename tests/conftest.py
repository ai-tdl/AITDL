"""
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
"""

"""
Test fixtures — tests/conftest.py

Purpose : Provide a per-test in-memory SQLite async database so that tests
          run without a live PostgreSQL connection. The FastAPI `get_db`
          dependency is overridden via app.dependency_overrides.

Input   : None (auto-discovered by pytest)
Output  : Fixtures: async_engine, db_session, override applied to app
Errors  : aiosqlite must be installed (see requirements.txt or pip install aiosqlite)
"""

import pytest_asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import AsyncClient, ASGITransport

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "plugins"))
 
import sqlite3
import uuid
# Register UUID adapter for sqlite3 (used in tests via aiosqlite)
sqlite3.register_adapter(uuid.UUID, lambda u: str(u))
sqlite3.register_converter("GUID", lambda v: uuid.UUID(v.decode()))

# MOCK SUPABASE ENV VARS FOR TESTING
os.environ["SECRET_KEY"] = "test-secret-key-for-pydantic-validation-only-12345"
os.environ["DEBUG"] = "true"
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "mock-anon-key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock-service-role"
os.environ["SUPABASE_JWT_SECRET"] = "mock-supabase-jwt-secret-key-12345678901234567890123456789012"
os.environ["JWT_ALGORITHM"] = "HS256"

from main import app
from core.database import Base, get_db
from models.db_tables import ContactRecord, PartnerRecord  # noqa: ensure tables registered
from core.config import settings
try:
    from jose import jwt
except ImportError:
    # Fallback to PyJWT if jose is not available
    import jwt
from datetime import datetime, timedelta, timezone

def create_mock_supabase_token(payload_override: dict = None) -> str:
    """Simulates a Supabase Auth JWT. payload_override merges with the base token."""
    payload = {
        "sub": "123e4567-e89b-12d3-a456-426614174000",
        "app_metadata": {"role": "superadmin"},
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    if payload_override:
        payload.update(payload_override)
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

# ── Register CMS ORM models so in-memory SQLite creates their tables ──────────
try:
    import cms_core.models.cms_tables  # noqa: F401
except ImportError:
    pass  # CMS plugin not present — skip silently

# ── Platform Kernel Bootstrap (Lifespan doesn't fire in unit tests) ──────────
import platform_kernel
import asyncio

# We need to run the kernel initialization synchronously or in an event loop
_kernel = platform_kernel.bootstrap(app)
# Since kernel.initialize() is async, we run it to completion
asyncio.run(_kernel.initialize())


# ── In-memory SQLite engine ────────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def async_engine():
    """
    Purpose : Create a fresh in-memory SQLite async engine per test.
    Input   : None
    Output  : AsyncEngine with all tables created
    Errors  : Raises if aiosqlite is not installed
    """
    import json
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        json_serializer=lambda obj: json.dumps(obj, default=str)
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(async_engine):
    """
    Purpose : Yield an async session bound to the test engine.
    Input   : async_engine fixture
    Output  : AsyncSession
    Errors  : Rolls back on failure, closes after test
    """
    TestSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="function", autouse=True)
async def override_get_db(db_session):
    """
    Purpose : Replace the FastAPI get_db dependency with the test session
              so no real database is required during testing.
    Input   : db_session fixture
    Output  : None (side effect: app.dependency_overrides mutated)
    Errors  : Cleaned up automatically after each test
    """
    async def _override():
        yield db_session

    app.dependency_overrides[get_db] = _override
    yield
    app.dependency_overrides.clear()
