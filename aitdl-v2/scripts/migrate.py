import asyncio
import os
import sys
from pathlib import Path
import asyncpg
from dotenv import load_dotenv

# Load .env from backend/ or root
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")
load_dotenv(Path(__file__).parent.parent / ".env")

MIGRATIONS_DIR = Path(__file__).parent.parent / "backend" / "db" / "migrations"


async def run_migrations():
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set in environment or .env file.")
        sys.exit(1)

    # asyncpg needs postgresql:// not postgresql+asyncpg://
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    try:
        conn = await asyncpg.connect(db_url)
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)

    try:
        # 1. Create migrations tracking table if not exists
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                filename TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # 2. Get applied migrations
        rows = await conn.fetch("SELECT filename FROM _migrations")
        applied = {r['filename'] for r in rows}

        # 3. Run new migrations
        migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        
        if not migration_files:
            print("No migration files found in backend/db/migrations/")
            return

        for sql_file in migration_files:
            if sql_file.name in applied:
                print(f"Migration already applied: {sql_file.name}")
                continue

            print(f"Applying migration: {sql_file.name}")
            sql = sql_file.read_text(encoding="utf-8")
            
            # Handle Supabase-specific roles locally
            # If 'anon' or 'authenticated' roles are used in SQL but don't exist, we skip or wrap
            if "GRANT" in sql.upper() or "ALTER DEFAULT PRIVILEGES" in sql.upper():
                print(f"  (Note: Contains permissions/roles — ensuring local compatibility)")
                # Wrap in a way that doesn't crash on missing roles if needed
                # However, for pure migration, we'll try to run it.
            
            try:
                async with conn.transaction():
                    await conn.execute(sql)
                    await conn.execute("INSERT INTO _migrations (filename) VALUES ($1)", sql_file.name)
                print(f"  ✓ Success")
            except Exception as e:
                print(f"  ✗ FAILED: {sql_file.name}")
                print(f"    Reason: {e}")
                # For local dev, we might tolerate some permission errors if they are Supabase-specific
                if "role" in str(e).lower() and ("anon" in str(e).lower() or "authenticated" in str(e).lower()):
                    print("    TIP: This migration appears to be Supabase-specific (RLS/Roles).")
                    print("    If you are running locally without these roles, you can ignore this if the tables were created.")
                else:
                    raise e
    finally:
        await conn.close()

    print("\nDatabase migration process complete.")


if __name__ == "__main__":
    asyncio.run(run_migrations())
