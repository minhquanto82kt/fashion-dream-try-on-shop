"""Vercel entrypoint for the FastAPI admin tags collection route."""

import sys
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]
PYTHON_ROOT = APP_ROOT / "python"
if str(PYTHON_ROOT) not in sys.path:
    sys.path.insert(0, str(PYTHON_ROOT))

from app.main import app  # noqa: E402
