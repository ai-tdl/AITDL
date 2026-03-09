import asyncio
import asyncpg
import argparse

async def create_db(host, port, user, password, install_pw):
    # Try connecting without a password first, or with default 'postgres' password
    try:
        conn = await asyncpg.connect(user=user, host=host, port=port, password=install_pw)
        print("Connected successfully to default postgres database.")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    try:
        # Create database
        print("Creating database aitdl_dev...")
        await conn.execute("CREATE DATABASE aitdl_dev")
        print("Database aitdl_dev created.")
    except asyncpg.exceptions.DuplicateDatabaseError:
        print("Database aitdl_dev already exists.")
    except Exception as e:
        print(f"Error creating database: {e}")

    try:
        print("Setting password for user postgres...")
        await conn.execute(f"ALTER USER postgres WITH PASSWORD '{password}'")
        print("Password set for user postgres.")
    except Exception as e:
        print(f"Error configuring role: {e}")
        
    await conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", default="5434")
    parser.add_argument("--user", default="postgres")
    parser.add_argument("--target_password", default="yourpassword")
    parser.add_argument("--current_password", default=None)
    args = parser.parse_args()
    
    asyncio.run(create_db(args.host, args.port, args.user, args.target_password, args.current_password))
