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

def check_kernel():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    kernel_path = os.path.join(root, "backend", "platform_kernel.py")
    main_path = os.path.join(root, "backend", "main.py")

    if not os.path.exists(kernel_path):
        print("ERROR: Platform Kernel (backend/platform_kernel.py) not found.")
        sys.exit(1)

    with open(main_path, "r", encoding="utf-8") as f:
        content = f.read()
        if "platform_kernel" not in content:
            print("ERROR: backend/main.py does not appear to use platform_kernel.")
            sys.exit(1)

    print("SUCCESS: Platform Kernel verified and integrated in main.py.")

if __name__ == "__main__":
    check_kernel()
