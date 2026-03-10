import asyncio
import os
import sys
from pathlib import Path
import asyncpg
from dotenv import load_dotenv

# Load .env locally if present
load_dotenv(Path(__file__).parent.parent / ".env")

MIGRATIONS_DIR = Path(__file__).parent / "migrations"

async def run_migrations():
    """Run pending SQL migrations against the database."""
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        return {"status": "error", "message": "DATABASE_URL not set"}

    # asyncpg needs postgresql:// not postgresql+asyncpg://
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    try:
        conn = await asyncpg.connect(db_url)
    except Exception as e:
        return {"status": "error", "message": f"Could not connect to database: {e}"}

    applied_files = []
    
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
            return {"status": "success", "message": "No migration files found."}

        for sql_file in migration_files:
            if sql_file.name in applied:
                continue

            sql = sql_file.read_text(encoding="utf-8")
            
            try:
                async with conn.transaction():
                    await conn.execute(sql)
                    await conn.execute("INSERT INTO _migrations (filename) VALUES ($1)", sql_file.name)
                applied_files.append(sql_file.name)
            except Exception as e:
                # Tolerate Supabase specific role errors if they pop up during standalone migrations
                if "role" in str(e).lower() and ("anon" in str(e).lower() or "authenticated" in str(e).lower()):
                    pass
                else:
                    return {"status": "error", "message": f"Failed at {sql_file.name}: {e}"}
    finally:
        await conn.close()

    return {
        "status": "success",
        "message": "Migration process complete.",
        "applied": applied_files
    }

if __name__ == "__main__":
    result = asyncio.run(run_migrations())
    print(result)
