"""Lightweight, reproducible image-output checks for Colab experiments."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image


def evaluate_image(path: str | Path) -> dict[str, object]:
    """Return deterministic structural checks; this is not a perceptual score."""
    image_path = Path(path)
    with Image.open(image_path) as image:
        width, height = image.size
        return {
            "path": str(image_path),
            "format": image.format,
            "width": width,
            "height": height,
            "mode": image.mode,
            "megapixels": round((width * height) / 1_000_000, 3),
            "valid": width > 0 and height > 0,
        }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python evaluate_image.py <image-path>")
    print(json.dumps(evaluate_image(sys.argv[1]), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
