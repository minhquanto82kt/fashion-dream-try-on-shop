"""Fashion product vision endpoints."""

from fastapi import APIRouter

from app.models.product_vision import ProductVisionRequest, ProductVisionResult
from app.services.product_vision_service import ProductVisionService

router = APIRouter(prefix="/api/product-vision", tags=["product-vision"])
service = ProductVisionService()


@router.post("/analyze", response_model=ProductVisionResult)
def analyze_product(request: ProductVisionRequest) -> ProductVisionResult:
    """Analyze a product image through the provider-independent vision layer."""

    return service.analyze(request)
