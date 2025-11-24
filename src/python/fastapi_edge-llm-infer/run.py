import sys
from pathlib import Path

# Ensure src/ is on path when running `uvicorn run:app`
root = Path(__file__).resolve().parent
src = root / "src"
if str(src) not in sys.path:
    sys.path.insert(0, str(src))

from app.main import app  # noqa: E402
