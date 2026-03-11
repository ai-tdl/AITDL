"""
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
"""

import os
import sys

REQUIRED_DIRS = [
    "apps",
    "backend",
    ".github/workflows",
]

# These are now internal to backend
CORE_BACKEND_DIRS = [
    "backend/core",
    "backend/plugins",
    "backend/products",
    "backend/agents",
    "backend/scripts",
    "backend/tests",
]

def check_structure():
    # Scripts are now in backend/scripts, so root is 3 levels up from __file__
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    print(f"Checking AITDL Repository Structure (Monorepo V3) at: {root}")
    
    missing = []
    for d in REQUIRED_DIRS:
        path = os.path.join(root, d)
        if not os.path.isdir(path):
            missing.append(d)
    
    if missing:
        print(f"ERROR: Missing required directories: {', '.join(missing)}")
        sys.exit(1)
    
    print("SUCCESS: All required directories present.")

if __name__ == "__main__":
    check_structure()
