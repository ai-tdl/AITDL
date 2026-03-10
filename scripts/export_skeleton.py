#!/usr/bin/env python3
"""
AITDL Skeleton Exporter — scripts/export_skeleton.py
Produces a clean, accurate tree of the project.
Run: python scripts/export_skeleton.py > project_skeleton.txt
"""
import sys
import io
from pathlib import Path

# Force UTF-8 encoding for stdout to handle tree characters on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

IGNORE = {
    ".git", "__pycache__", "node_modules", ".next", ".pytest_cache",
    "venv", ".venv", "env", ".env", "dist", "build", ".mypy_cache",
}

def skip(p: Path) -> bool:
    return p.name in IGNORE or p.suffix == ".pyc"

def tree(path: Path, prefix=""):
    try:
        entries = sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
    except PermissionError:
        return
    entries = [e for e in entries if not skip(e)]
    for i, entry in enumerate(entries):
        last = i == len(entries) - 1
        connector = "└── " if last else "├── "
        suffix = "/" if entry.is_dir() else ""
        print(prefix + connector + entry.name + suffix)
        if entry.is_dir():
            tree(entry, prefix + ("    " if last else "│   "))

def main():
    output_path = Path("project_skeleton.txt")
    with output_path.open("w", encoding="utf-8") as f:
        # Save original stdout
        original_stdout = sys.stdout
        sys.stdout = f
        try:
            print("AITDL/")
            tree(Path("."))
        finally:
            sys.stdout = original_stdout
    print(f"Skeleton exported to {output_path.absolute()}")

if __name__ == "__main__":
    main()
