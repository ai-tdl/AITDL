import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), "backend"))
os.chdir("backend")
try:
    from core.config import settings
    print("Settings loaded successfully")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
except Exception as e:
    print(f"Error loading settings: {e}")
    import traceback
    traceback.print_exc()
