"""Tests for deterministic product recommendation scoring."""

from app.models.recommendation import RecommendationPreferences
from app.services.recommendation_service import recommend_products, score_product


def test_matching_attributes_raise_score() -> None:
    product = {
        "id": "p1",
        "name": "Black Casual Tee",
        "price": 300000,
        "colors": ["black"],
        "style_tags": ["casual"],
        "garment_type": "top",
    }
    preferences = RecommendationPreferences(
        colors=["black"],
        style_tags=["casual"],
        garment_type="top",
        max_price=500000,
    )

    result = score_product(product, preferences)

    assert result.score == 100.0
    assert "color:black" in result.matched_attributes
    assert "style:casual" in result.matched_attributes
    assert "type:top" in result.matched_attributes
    assert "price:within-budget" in result.matched_attributes


def test_non_matching_product_can_still_be_returned() -> None:
    product = {"id": "p2", "name": "Unknown Product", "price": 900000}
    preferences = RecommendationPreferences(colors=["black"])

    result = score_product(product, preferences)

    assert result.score == 0.0
    assert result.matched_attributes == []


def test_recommendations_are_ranked_and_limited() -> None:
    products = [
        {"id": "low", "name": "Other", "colors": ["white"]},
        {"id": "high", "name": "Black", "colors": ["black"]},
        {"id": "mid", "name": "Black Casual", "colors": ["black"], "style_tags": ["casual"]},
    ]

    result = recommend_products(
        RecommendationPreferences(colors=["black"], style_tags=["casual"]),
        limit=2,
        products=products,
    )

    assert [item.product["id"] for item in result.items] == ["mid", "high"]
    assert result.strategy == "deterministic-v1"
