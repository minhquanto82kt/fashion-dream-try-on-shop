"""Recommendation API endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.models.recommendation import RecommendationRequest, RecommendationResult
from app.services.product_vision_repository import ProductVisionRepository
from app.services.recommendation_service import recommend_products

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResult)
def get_recommendations(
    request: RecommendationRequest,
    _: dict = Depends(get_current_user),
) -> RecommendationResult:
    """Return ranked active products using persisted Product Vision attributes."""

    return recommend_products(
        request.preferences,
        request.limit,
        vision_repository=ProductVisionRepository(),
    )
