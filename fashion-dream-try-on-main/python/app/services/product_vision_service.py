"""Provider abstraction for fashion product image understanding."""

from dataclasses import dataclass

from app.models.product_vision import (
    ProductGarmentType,
    ProductVisionRequest,
    ProductVisionResult,
)


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

        return self.provider.analyze(request)
