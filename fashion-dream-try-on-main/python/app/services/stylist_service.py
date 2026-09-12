"""Deterministic AI Stylist orchestration for the MVP."""

from __future__ import annotations

from app.models.recommendation import RecommendationPreferences
from app.models.stylist import StylistRecommendation, StylistRequest, StylistResult
from app.services.recommendation_service import recommend_products


class StylistService:
    """Turn shopper intent into explainable catalog recommendations."""

    def recommend(self, request: StylistRequest) -> StylistResult:
        preferences = RecommendationPreferences(
            colors=request.preferences.get("colors", []),
            style_tags=request.preferences.get("style_tags", []),
            garment_type=request.preferences.get("garment_type"),
            max_price=request.preferences.get("max_price"),
        )
        result = recommend_products(preferences, request.limit)
        recommendations = []
        for item in result.items:
            reason = self._reason(item.matched_attributes, request.occasion, request.mood)
            recommendations.append(
                StylistRecommendation(product=item.product, score=item.score, reason=reason)
            )

        context = ", ".join(value for value in (request.occasion, request.mood) if value)
        summary = (
            f"Selected {len(recommendations)} products"
            + (f" for {context}" if context else " based on your preferences")
            + "."
        )
        return StylistResult(recommendations=recommendations, summary=summary)

    @staticmethod
    def _reason(matches: list[str], occasion: str | None, mood: str | None) -> str:
        labels = []
        for match in matches:
            labels.append(match.split(":", 1)[1].replace("-", " "))
        if labels:
            reason = "Matches " + ", ".join(labels[:3])
        else:
            reason = "A catalog option with limited attribute data"
        if occasion:
            reason += f"; suitable for {occasion}"
        if mood:
            reason += f"; fits a {mood} mood"
        return reason + "."
