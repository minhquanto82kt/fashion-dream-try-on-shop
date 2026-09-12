"""Fashion product vision endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.models.product_vision import ProductVisionRequest, ProductVisionResult
from app.services.product_vision_service import ProductVisionService

router = APIRouter(prefix="/api/product-vision", tags=["product-vision"])
service = ProductVisionService()


@router.post("/analyze", response_model=ProductVisionResult)
def analyze_product(
    request: ProductVisionRequest,
    _current_user: Annotated[dict, Depends(get_current_user)],
) -> ProductVisionResult:
    """Analyze a product image through the provider-independent vision layer."""

    return service.analyze(request)
