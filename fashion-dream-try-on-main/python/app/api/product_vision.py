"""Fashion product vision endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.core.rate_limit import (
    PRODUCT_VISION_REQUESTS,
    PRODUCT_VISION_WINDOW_SECONDS,
    RateLimitExceeded,
    ai_rate_limiter,
)
from app.models.product_vision import ProductVisionRequest, ProductVisionResult
from app.services.product_vision_service import ProductVisionService

router = APIRouter(prefix="/api/product-vision", tags=["product-vision"])
service = ProductVisionService()


@router.post("/analyze", response_model=ProductVisionResult)
def analyze_product(
    request: ProductVisionRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ProductVisionResult:
    """Analyze a product image through the provider-independent vision layer."""

    try:
        ai_rate_limiter.check(
            str(current_user["id"]),
            PRODUCT_VISION_REQUESTS,
            PRODUCT_VISION_WINDOW_SECONDS,
        )
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many Product Vision requests. Please wait before trying again.",
            headers={"Retry-After": str(PRODUCT_VISION_WINDOW_SECONDS)},
        ) from exc

    return service.analyze(request)
