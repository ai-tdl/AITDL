#!/bin/bash
echo "=== DIRECTORY CONTENTS ==="
ls -la
echo "=========================="
export PYTHONPATH=.
if [ -f ".venv/bin/python" ]; then
    .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
else
    python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
fi
