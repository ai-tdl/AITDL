import asyncio
import os
import sys
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add backend to sys.path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from models.db_tables import AdminUser
from core.security import verify_password

async def check_admin():
    db_url = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///aitdl.db")
    if "postgresql" in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession)
    
    async with async_session() as session:
        result = await session.execute(select(AdminUser).where(AdminUser.email == "iamadmin@aitdl.com"))
        admin = result.scalar_one_or_none()
        
        if admin:
            print(f"Admin Found: {admin.email}")
            print(f"Role: {admin.role}")
            print(f"Is Active: {admin.is_active}")
            
            pwd = "Aitdl@2026"
            match = verify_password(pwd, admin.password_hash)
            print(f"Password 'Aitdl@2026' matches: {match}")
            
            pwd_lower = "aitdl@2026"
            match_lower = verify_password(pwd_lower, admin.password_hash)
            print(f"Password 'aitdl@2026' matches: {match_lower}")
        else:
            print("Admin NOT found!")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / "backend" / ".env")
    asyncio.run(check_admin())
