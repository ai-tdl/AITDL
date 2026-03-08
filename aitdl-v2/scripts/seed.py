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

import asyncio, os
import asyncpg


async def seed():
    db_url = os.environ.get("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    if not db_url:
        print("DATABASE_URL not set — skipping seed.")
        return

    conn = await asyncpg.connect(db_url)
    try:
        # Seed contacts
        await conn.execute("""
            INSERT INTO contacts (name, phone, section, business, city, message)
            VALUES
                ('Demo Retailer', '9876543210', 'retail', 'Demo Shop', 'Mumbai', 'Test lead'),
                ('Demo School',   '9876543211', 'education', 'ABC School', 'Nashik', 'School demo')
            ON CONFLICT DO NOTHING
        """)

        # Seed partner applications
        await conn.execute("""
            INSERT INTO partner_applications (name, phone, city, occupation, message)
            VALUES
                ('Ramesh Sharma', '9876543212', 'Nashik', 'IT Consultant', 'Interested in partnership')
            ON CONFLICT DO NOTHING
        """)

        print("Seed data inserted.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
