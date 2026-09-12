"""Edge-case tests for the AI Stylist layer."""

from unittest.mock import patch

from app.models.recommendation import RecommendationResult
from app.models.stylist import StylistRequest
from app.services.stylist_service import StylistService


def test_stylist_returns_safe_empty_result() -> None:
    with patch("app.services.stylist_service.recommend_products", return_value=RecommendationResult()):
        result = StylistService().recommend(StylistRequest())

    assert result.recommendations == []
    assert result.summary == "Selected 0 products based on your preferences."
