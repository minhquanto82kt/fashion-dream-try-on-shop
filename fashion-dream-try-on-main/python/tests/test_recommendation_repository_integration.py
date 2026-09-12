"""Tests that recommendations consume Product Vision persistence."""

from unittest.mock import Mock

from app.models.recommendation import RecommendationPreferences
from app.services.recommendation_service import recommend_products


def test_recommendations_read_persisted_vision_attributes() -> None:
    repository = Mock()
    repository.get_by_product_id.side_effect = [
        {"style_tags": ["casual"], "colors": ["black"], "garment_type": "top"},
        None,
    ]
    products = [
        {"id": "p1", "name": "Vision Tee", "price": 300000},
        {"id": "p2", "name": "Plain Product", "price": 300000},
    ]

    result = recommend_products(
        RecommendationPreferences(colors=["black"], style_tags=["casual"], garment_type="top"),
        products=products,
        vision_repository=repository,
    )

    assert result.items[0].product["id"] == "p1"
    assert result.items[0].score == 90.0
    assert repository.get_by_product_id.call_count == 2
