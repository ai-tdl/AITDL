import os
import asyncio
import asyncpg

env_vars = {}
with open('backend/.env', 'r', encoding='utf-8') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env_vars[k.strip()] = v.strip().strip('\"\'')

db_url = env_vars.get('DATABASE_URL')
if not db_url:
    print('DATABASE_URL not found')
    exit(1)

if db_url.startswith('postgresql+asyncpg://'):
    db_url = db_url.replace('postgresql+asyncpg://', 'postgresql://')

async def run_sql():
    print(f'Connecting to {db_url.split(\"@\")[1]}...')
    conn = await asyncpg.connect(db_url)
    
    migrations = [
        'backend/db/migrations/007_cms_workspaces.sql',
        'backend/db/migrations/008_cms_content.sql',
        'backend/db/migrations/009_cms_aux.sql'
    ]
    
    for m in migrations:
        print(f'Running {m}...')
        with open(m, 'r', encoding='utf-8') as f:
            sql = f.read()
            await conn.execute(sql)
            
    await conn.close()
    print('All migrations applied.')

asyncio.run(run_sql())
