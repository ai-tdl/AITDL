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

import asyncio, os, sys
import asyncpg
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).parent.parent / "backend" / "db" / "migrations"


async def run_migrations():
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set. Copy .env.example to .env and fill it in.")
        sys.exit(1)

    # asyncpg needs postgresql:// not postgresql+asyncpg://
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    conn = await asyncpg.connect(db_url)
    try:
        for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
            print(f"Running migration: {sql_file.name}")
            sql = sql_file.read_text(encoding="utf-8")
            await conn.execute(sql)
            print(f"  ✓ Done")
    finally:
        await conn.close()

    print("\nAll migrations applied.")


if __name__ == "__main__":
    asyncio.run(run_migrations())
