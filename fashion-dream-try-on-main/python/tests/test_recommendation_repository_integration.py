"""Tests that recommendations consume Product Vision persistence."""

from unittest.mock import Mock

from app.models.recommendation import RecommendationPreferences
from app.services.recommendation_service import recommend_products


def test_recommendations_read_persisted_vision_attributes_in_one_batch() -> None:
    repository = Mock()
    repository.list_by_product_ids.return_value = {
        "p1": {"style_tags": ["casual"], "colors": ["black"], "garment_type": "top"},
    }
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
    repository.list_by_product_ids.assert_called_once_with(["p1", "p2"])
    repository.get_by_product_id.assert_not_called()
