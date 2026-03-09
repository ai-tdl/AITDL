import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime, timezone

# Add backend to sys.path for imports
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")
load_dotenv(Path(__file__).parent.parent / ".env")

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from models.db_tables import ContactRecord, PartnerRecord

async def seed_data():
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set.")
        return

    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:


        # 2. Add Sample Leads if empty
        result = await session.execute(select(ContactRecord).limit(1))
        if not result.scalar_one_or_none():
            print("Adding sample leads...")
            samples = [
                ContactRecord(name="Jawahar Mallah", email="jawahar@aitdl.com", phone="9876543210", business="GanitSutram", message="Interested in Retail POS", section="retail", status="new"),
                ContactRecord(name="Sample Merchant", email="merchant@example.com", phone="9000000001", business="City Mall", message="Need ERP implementation", section="erp", status="contacted", contacted_at=datetime.now(timezone.utc)),
            ]
            session.add_all(samples)

        # 3. Add Sample Partners if empty
        result = await session.execute(select(PartnerRecord).limit(1))
        if not result.scalar_one_or_none():
            print("Adding sample partners...")
            partners = [
                PartnerRecord(name="Local Tech Solutions", email="partner@tech.com", phone="8888888888", city="Mumbai", occupation="IT Services", message="Want to resell AITDL products", status="pending"),
            ]
            session.add_all(partners)

        await session.commit()
    
    print("\nSeeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_data())
