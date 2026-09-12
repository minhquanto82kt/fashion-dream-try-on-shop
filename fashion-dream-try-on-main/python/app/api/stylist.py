"""AI Stylist API endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.models.stylist import StylistRequest, StylistResult
from app.services.stylist_service import StylistService

router = APIRouter(prefix="/api/stylist", tags=["stylist"])


@router.post("/recommend", response_model=StylistResult)
def stylist_recommend(
    request: StylistRequest,
    _: dict = Depends(get_current_user),
) -> StylistResult:
    """Return explainable stylist recommendations for the authenticated shopper."""

    return StylistService().recommend(request)
