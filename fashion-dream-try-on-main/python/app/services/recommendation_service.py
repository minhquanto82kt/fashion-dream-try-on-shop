"""Deterministic product recommendation engine for the MVP."""

from __future__ import annotations

from typing import Any

from app.models.recommendation import (
    RecommendationItem,
    RecommendationPreferences,
    RecommendationResult,
)
from app.services.product_service import list_active_products


STYLE_WEIGHT = 40.0
COLOR_WEIGHT = 30.0
TYPE_WEIGHT = 20.0
PRICE_WEIGHT = 10.0


def _tokens(value: Any) -> set[str]:
    if isinstance(value, str):
        return {value.strip().lower()} if value.strip() else set()
    if isinstance(value, (list, tuple, set)):
        return {str(item).strip().lower() for item in value if str(item).strip()}
    return set()


def _product_price(product: dict[str, Any]) -> float | None:
    value = product.get("price")
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def score_product(product: dict[str, Any], preferences: RecommendationPreferences) -> RecommendationItem:
    """Score one product using only attributes already present on the product row."""

    matched: list[str] = []
    score = 0.0

    product_styles = _tokens(product.get("style_tags") or product.get("styles"))
    preferred_styles = _tokens(preferences.style_tags)
    if preferred_styles and product_styles:
        overlap = preferred_styles & product_styles
        if overlap:
            score += STYLE_WEIGHT * len(overlap) / len(preferred_styles)
            matched.extend(f"style:{value}" for value in sorted(overlap))

    product_colors = _tokens(product.get("colors") or product.get("color"))
    preferred_colors = _tokens(preferences.colors)
    if preferred_colors and product_colors:
        overlap = preferred_colors & product_colors
        if overlap:
            score += COLOR_WEIGHT * len(overlap) / len(preferred_colors)
            matched.extend(f"color:{value}" for value in sorted(overlap))

    preferred_type = (preferences.garment_type or "").strip().lower()
    product_type = str(product.get("garment_type") or "").strip().lower()
    if preferred_type and product_type and preferred_type == product_type:
        score += TYPE_WEIGHT
        matched.append(f"type:{preferred_type}")

    price = _product_price(product)
    if preferences.max_price is not None and price is not None and price <= preferences.max_price:
        score += PRICE_WEIGHT
        matched.append("price:within-budget")

    return RecommendationItem(
        product=product,
        score=round(min(score, 100.0), 2),
        matched_attributes=matched,
    )


def recommend_products(
    preferences: RecommendationPreferences,
    limit: int = 8,
    products: list[dict[str, Any]] | None = None,
) -> RecommendationResult:
    """Rank active catalog products without changing database state."""

    catalog = products if products is not None else list_active_products()
    ranked = [score_product(product, preferences) for product in catalog]
    ranked.sort(
        key=lambda item: (
            item.score,
            item.product.get("featured", False),
            item.product.get("created_at", ""),
        ),
        reverse=True,
    )

    return RecommendationResult(items=ranked[:limit])
