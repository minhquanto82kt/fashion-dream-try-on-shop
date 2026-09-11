"""Provider abstraction for fashion product image understanding."""

from dataclasses import dataclass

from app.models.product_vision import (
    ProductGarmentType,
    ProductVisionRequest,
    ProductVisionResult,
)
from app.services.product_attribute_service import normalize_product_attributes


@dataclass(frozen=True)
class ProductVisionProvider:
    """Base contract for future computer-vision providers."""

    name: str

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Analyze one product image."""

        raise NotImplementedError


class StubProductVisionProvider(ProductVisionProvider):
    """Deterministic provider used until a production vision model is selected."""

    def __init__(self) -> None:
        super().__init__(name="stub")

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Return a safe baseline without pretending to infer image attributes."""

        return ProductVisionResult(
            product_id=request.product_id,
            garment_type=ProductGarmentType.UNKNOWN,
            provider=self.name,
        )


class ProductVisionService:
    """Orchestrate product vision independently from a model vendor."""

    def __init__(self, provider: ProductVisionProvider | None = None) -> None:
        self.provider = provider or StubProductVisionProvider()

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Analyze a product using the configured vision provider."""

        return normalize_product_attributes(self.provider.analyze(request))
