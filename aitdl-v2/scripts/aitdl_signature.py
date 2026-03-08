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

"""
AITDL Signature Script — scripts/aitdl_signature.py

Purpose : Prints the AITDL system identity to stdout.
          Can be used as a health / identity check in CI/CD pipelines.
          
Usage   : python scripts/aitdl_signature.py
Output  : Formatted AITDL identity block
Errors  : None — static output, no I/O dependencies

Rule 13: Code Fingerprint Rule — do not remove or modify.
"""

import json
import sys
import os

# ── Resolve path to core/aitdl_identity.json ──────────────────────────────────
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_identity_path = os.path.join(_root, "core", "aitdl_identity.json")


def load_identity() -> dict:
    """
    Purpose : Load identity from core/aitdl_identity.json
    Input   : None (uses resolved path above)
    Output  : dict
    Errors  : Exits with code 1 if file not found
    """
    if not os.path.exists(_identity_path):
        print(f"[AITDL SIGNATURE] ERROR: identity file not found at {_identity_path}", file=sys.stderr)
        sys.exit(1)
    with open(_identity_path, encoding="utf-8") as f:
        return json.load(f)


def print_signature(identity: dict) -> None:
    """
    Purpose : Print formatted AITDL signature to stdout
    Input   : identity dict
    Output  : None (side effect: stdout)
    Errors  : None
    """
    block = identity.get("_aitdl", identity)
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║           || ॐ श्री गणेशाय नमः ||                      ║")
    print("╠══════════════════════════════════════════════════════════╣")
    print(f"║  Organization : {block.get('org', block.get('full_name', ''))[:42]:<42}  ║")
    print(f"║  Creator      : {block.get('creator', ''):<42}  ║")
    print(f"║  Role         : {block.get('role', ''):<42}  ║")
    print(f"║  Email        : {block.get('email', ''):<42}  ║")
    print(f"║  Fingerprint  : {block.get('fingerprint', ''):<42}  ║")
    print(f"║  Version      : {block.get('version', ''):<42}  ║")
    print("╠══════════════════════════════════════════════════════════╣")
    print(f"║  Then : {block.get('epoch_then', block.get('temporal_stamp', {}).get('classical', '')):<50}  ║")
    print(f"║  Now  : {block.get('epoch_now',  block.get('temporal_stamp', {}).get('modern',    '')):<50}  ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()


if __name__ == "__main__":
    identity = load_identity()
    print_signature(identity)
