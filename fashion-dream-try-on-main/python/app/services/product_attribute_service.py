"""Deterministic fashion attribute normalization for Product Vision.

This layer turns provider output into a stable, catalog-friendly vocabulary.
It deliberately does not claim to infer attributes from pixels by itself.
"""

from __future__ import annotations

import re
from typing import Iterable

from app.models.product_vision import ProductGarmentType, ProductVisionResult


ALLOWED_STYLE_TAGS = {
    "minimal",
    "casual",
    "streetwear",
    "smart-casual",
    "formal",
    "sporty",
    "vintage",
    "preppy",
    "workwear",
    "utility",
    "oversized",
    "tailored",
    "feminine",
    "masculine",
    "unisex",
}

ALLOWED_MATERIALS = {
    "cotton",
    "linen",
    "denim",
    "wool",
    "leather",
    "silk",
    "polyester",
    "nylon",
    "knit",
    "canvas",
}

ALLOWED_PATTERNS = {
    "solid",
    "striped",
    "checked",
    "plaid",
    "floral",
    "graphic",
    "logo",
    "geometric",
    "camo",
    "animal-print",
}


def _clean_tokens(values: Iterable[str], allowed: set[str]) -> list[str]:
    """Normalize a list into a deterministic, deduplicated vocabulary."""

    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        token = re.sub(r"\s+", " ", value.strip().lower())
        if token in allowed and token not in seen:
            result.append(token)
            seen.add(token)
    return result


def normalize_product_attributes(result: ProductVisionResult) -> ProductVisionResult:
    """Normalize provider output without inventing missing attributes."""

    confidence = result.confidence
    if confidence is not None:
        confidence = max(0.0, min(1.0, confidence))

    material = result.material.strip().lower() if result.material else None
    if material not in ALLOWED_MATERIALS:
        material = None

    pattern = result.pattern.strip().lower() if result.pattern else None
    if pattern not in ALLOWED_PATTERNS:
        pattern = None

    return result.model_copy(
        update={
            "colors": _clean_tokens(result.colors, {
                "black", "white", "gray", "grey", "brown", "beige",
                "cream", "navy", "blue", "light-blue", "green", "olive",
                "yellow", "orange", "red", "pink", "purple", "burgundy",
                "multi-color",
            }),
            "style_tags": _clean_tokens(result.style_tags, ALLOWED_STYLE_TAGS),
            "material": material,
            "pattern": pattern,
            "confidence": confidence,
        }
    )
