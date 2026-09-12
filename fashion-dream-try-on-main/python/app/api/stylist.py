"""AI Stylist API endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.core.rate_limit import (
    STYLIST_REQUESTS,
    STYLIST_WINDOW_SECONDS,
    RateLimitExceeded,
    ai_rate_limiter,
)
from app.models.stylist import StylistRequest, StylistResult
from app.services.stylist_service import StylistService

router = APIRouter(prefix="/api/stylist", tags=["stylist"])


@router.post("/recommend", response_model=StylistResult)
def stylist_recommend(
    request: StylistRequest,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StylistResult:
    """Return explainable stylist recommendations for the authenticated shopper."""

    try:
        ai_rate_limiter.check(
            str(user["id"]),
            STYLIST_REQUESTS,
            STYLIST_WINDOW_SECONDS,
        )
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many stylist requests. Please wait before trying again.",
            headers={"Retry-After": str(STYLIST_WINDOW_SECONDS)},
        ) from exc

    return StylistService().recommend(request)
