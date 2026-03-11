import sys, os
sys.path.insert(0, os.path.join(os.getcwd(), "backend"))
sys.path.insert(0, os.path.join(os.getcwd(), "plugins"))

from main import app

print("Registered Routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        print(f"{route.methods} {route.path}")
    else:
        print(f"Other route: {route}")
