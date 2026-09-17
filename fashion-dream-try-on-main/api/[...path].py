"""Vercel catch-all entrypoint for FastAPI API subpaths.

Vercel maps ``api/index.py`` to /api, but nested FastAPI routes such as
/api/admin/tags and /api/try-on/jobs also need a function route. This
catch-all keeps the FastAPI application as the single API source of truth.
"""

import sys
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]
PYTHON_ROOT = APP_ROOT / "python"
if str(PYTHON_ROOT) not in sys.path:
    sys.path.insert(0, str(PYTHON_ROOT))

from app.main import app  # noqa: E402
