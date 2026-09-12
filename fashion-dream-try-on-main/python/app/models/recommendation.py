"""Provider-independent recommendation models."""

from typing import Any

from pydantic import BaseModel, Field


class RecommendationPreferences(BaseModel):
    """Explicit preferences supplied by a shopper for one recommendation request."""

    colors: list[str] = Field(default_factory=list)
    style_tags: list[str] = Field(default_factory=list)
    garment_type: str | None = None
    max_price: float | None = Field(default=None, ge=0)


class RecommendationRequest(BaseModel):
    """Input for deterministic catalog recommendation."""

    preferences: RecommendationPreferences = Field(default_factory=RecommendationPreferences)
    limit: int = Field(default=8, ge=1, le=24)


class RecommendationItem(BaseModel):
    """One ranked product returned by the recommendation engine."""

    product: dict[str, Any]
    score: float = Field(ge=0, le=100)
    matched_attributes: list[str] = Field(default_factory=list)


class RecommendationResult(BaseModel):
    """Ranked recommendation response."""

    items: list[RecommendationItem] = Field(default_factory=list)
    strategy: str = "deterministic-v1"
