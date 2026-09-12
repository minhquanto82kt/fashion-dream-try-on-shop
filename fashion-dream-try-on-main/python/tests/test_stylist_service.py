"""Tests for the explainable AI Stylist layer."""

from unittest.mock import patch

from app.models.recommendation import RecommendationItem, RecommendationResult
from app.models.stylist import StylistRequest
from app.services.stylist_service import StylistService


def test_stylist_builds_explainable_recommendations() -> None:
    catalog = RecommendationResult(
        items=[
            RecommendationItem(
                product={"id": "p1", "name": "Black Tee"},
                score=70,
                matched_attributes=["style:casual", "color:black"],
            )
        ]
    )

    with patch("app.services.stylist_service.recommend_products", return_value=catalog):
        result = StylistService().recommend(
            StylistRequest(occasion="weekend", mood="relaxed", preferences={"colors": ["black"]})
        )

    assert result.recommendations[0].product["id"] == "p1"
    assert result.recommendations[0].score == 70
    assert "casual" in result.recommendations[0].reason
    assert "weekend" in result.recommendations[0].reason
    assert "relaxed" in result.recommendations[0].reason
    assert result.strategy == "stylist-rules-v1"
