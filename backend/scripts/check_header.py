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

REQUIRED_INVOCATIONS = [
    "॥ ॐ श्री गणेशाय नमः ॥",
    "॥ ॐ श्री सरस्वत्यै नमः ॥",
    "॥ ॐ नमो नारायणाय ॥",
    "॥ ॐ नमः शिवाय ॥",
    "॥ ॐ दुर्गायै नमः ॥"
]

def check_header():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Files to check (Core Backend & Identity)
    files_to_check = [
        os.path.join(root, "backend", "main.py"),
        os.path.join(root, "backend", "platform_kernel.py"),
        os.path.join(root, "backend", "core", "aitdl_identity.py"),
        os.path.join(root, "scripts", "aitdl_signature.py"),
    ]

    failed = False
    for fpath in files_to_check:
        if not os.path.exists(fpath):
            continue
            
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            missing = [inv for inv in REQUIRED_INVOCATIONS if inv not in content]
            if missing:
                print(f"ERROR: Header incomplete in {os.path.basename(fpath)}. Missing: {' '.join(missing)}")
                failed = True

    if failed:
        sys.exit(1)
    
    print("SUCCESS: Universal Header compliance verified in core files.")

if __name__ == "__main__":
    check_header()
