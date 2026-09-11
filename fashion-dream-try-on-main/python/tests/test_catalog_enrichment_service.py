"""Tests for catalog enrichment orchestration."""

from app.models.product_vision import ProductGarmentType, ProductVisionResult
from app.services.catalog_enrichment_service import CatalogEnrichmentService
from app.services.product_vision_service import ProductVisionProvider


class FakeVisionProvider(ProductVisionProvider):
    def __init__(self) -> None:
        super().__init__(name="fake")

    def analyze(self, request):
        return ProductVisionResult(
            product_id=request.product_id,
            garment_type=ProductGarmentType.TOP,
            colors=["black"],
            style_tags=["streetwear"],
            material="cotton",
            pattern="solid",
            confidence=0.94,
            provider=self.name,
        )


def test_catalog_enrichment_to_record() -> None:
    from app.services.product_vision_service import ProductVisionService

    service = CatalogEnrichmentService(ProductVisionService(FakeVisionProvider()))
    result = service.analyze_product("p1", "https://example.com/p1.webp")

    assert result.to_record() == {
        "product_id": "p1",
        "garment_type": "top",
        "colors": ["black"],
        "style_tags": ["streetwear"],
        "material": "cotton",
        "pattern": "solid",
        "confidence": 0.94,
        "provider": "fake",
    }
