"""Recommendation API endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.core.rate_limit import (
    RECOMMENDATION_REQUESTS,
    RECOMMENDATION_WINDOW_SECONDS,
    RateLimitExceeded,
    ai_rate_limiter,
)
from app.models.recommendation import RecommendationRequest, RecommendationResult
from app.services.product_vision_repository import ProductVisionRepository
from app.services.recommendation_service import recommend_products

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResult)
def get_recommendations(
    request: RecommendationRequest,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> RecommendationResult:
    """Return ranked active products using persisted Product Vision attributes."""

    try:
        ai_rate_limiter.check(
            str(user["id"]),
            RECOMMENDATION_REQUESTS,
            RECOMMENDATION_WINDOW_SECONDS,
        )
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many recommendation requests. Please wait before trying again.",
            headers={"Retry-After": str(RECOMMENDATION_WINDOW_SECONDS)},
        ) from exc

    return recommend_products(
        request.preferences,
        request.limit,
        vision_repository=ProductVisionRepository(),
    )
