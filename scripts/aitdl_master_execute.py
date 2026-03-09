import os
import subprocess

steps = [

    ("Verify Repository Structure", "python scripts/check_structure.py"),

    ("Verify Platform Kernel", "python scripts/check_kernel.py"),

    ("Verify Header Compliance", "python scripts/check_header.py"),

    ("Generate Dependency Map", "python scripts/dependency_map.py"),

    ("Run Platform Signature", "python scripts/aitdl_signature.py"),

    ("Run Test Suite", "python -m pytest"),
]


def run():

    print("\nAITDL PLATFORM MASTER EXECUTION\n")

    for name, cmd in steps:

        print(f"\nSTEP: {name}")

        result = subprocess.run(cmd, shell=True)

        if result.returncode != 0:
            print(f"\nFAILED: {name}")
            exit(1)

    print("\nAITDL PLATFORM VERIFIED SUCCESSFULLY\n")


if __name__ == "__main__":
    run()