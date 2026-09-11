"""Catalog enrichment orchestration for Product Vision."""

from dataclasses import dataclass
from typing import Any

from app.models.product_vision import ProductVisionRequest, ProductVisionResult
from app.services.product_vision_service import ProductVisionService


@dataclass(frozen=True)
class CatalogEnrichmentResult:
    """Vision output plus catalog fields that can be persisted later."""

    product_id: str
    attributes: ProductVisionResult

    def to_record(self) -> dict[str, Any]:
        """Return a DB-friendly representation without provider-specific fields."""

        return {
            "product_id": self.product_id,
            "garment_type": self.attributes.garment_type.value,
            "colors": self.attributes.colors,
            "style_tags": self.attributes.style_tags,
            "material": self.attributes.material,
            "pattern": self.attributes.pattern,
            "confidence": self.attributes.confidence,
            "provider": self.attributes.provider,
        }


class CatalogEnrichmentService:
    """Prepare product records for future AI-powered catalog enrichment."""

    def __init__(self, vision_service: ProductVisionService | None = None) -> None:
        self.vision_service = vision_service or ProductVisionService()

    def analyze_product(
        self, product_id: str, image_url: str
    ) -> CatalogEnrichmentResult:
        """Analyze one catalog image and return normalized attributes."""

        if not product_id.strip():
            raise ValueError("product_id is required")
        result = self.vision_service.analyze(
            ProductVisionRequest(image_url=image_url, product_id=product_id)
        )
        return CatalogEnrichmentResult(product_id=product_id, attributes=result)
