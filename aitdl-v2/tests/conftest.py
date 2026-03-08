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

from main import app
from core.database import Base, get_db
from models.db_tables import ContactRecord, PartnerRecord  # noqa: ensure tables registered


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
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
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
