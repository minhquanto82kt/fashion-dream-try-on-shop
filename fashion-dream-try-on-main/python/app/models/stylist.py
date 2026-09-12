"""Models for the AI Stylist response layer."""

from typing import Any

from pydantic import BaseModel, Field


class StylistRequest(BaseModel):
    occasion: str | None = Field(default=None, max_length=100)
    mood: str | None = Field(default=None, max_length=100)
    preferences: dict[str, Any] = Field(default_factory=dict)
    limit: int = Field(default=4, ge=1, le=8)


class StylistRecommendation(BaseModel):
    product: dict[str, Any]
    score: float = Field(ge=0, le=100)
    reason: str


class StylistResult(BaseModel):
    recommendations: list[StylistRecommendation] = Field(default_factory=list)
    summary: str
    strategy: str = "stylist-rules-v1"
