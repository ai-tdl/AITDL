#!/bin/bash
set -e

# Move to the directory where this script is located
cd "$(dirname "$0")"

echo "=== ENVIRONMENT ==="
pwd
echo "PYTHONPATH: $PYTHONPATH"
echo "=== DIRECTORY CONTENTS ==="
ls -la
echo "=========================="

# Ensure current directory is in PYTHONPATH
export PYTHONPATH=$PYTHONPATH:.

if [ -f ".venv/bin/python" ]; then
    echo "Starting AITDL Platform with virtual environment..."
    exec .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
else
    echo "Starting AITDL Platform with system environment..."
    exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
fi
