"""Provider abstraction for fashion product image understanding."""

from dataclasses import dataclass

from app.core.config import get_settings
from app.models.product_vision import (
    ProductGarmentType,
    ProductVisionRequest,
    ProductVisionResult,
)
from app.services.gemini_product_vision_provider import GeminiProductVisionProvider
from app.services.product_attribute_service import normalize_product_attributes


@dataclass(frozen=True)
class ProductVisionProvider:
    """Base contract for product-vision providers."""

    name: str

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Analyze one product image."""

        raise NotImplementedError


class StubProductVisionProvider(ProductVisionProvider):
    """Deterministic provider used when no real vision provider is configured."""

    def __init__(self) -> None:
        super().__init__(name="stub")

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Return a safe baseline without pretending to infer image attributes."""

        return ProductVisionResult(
            product_id=request.product_id,
            garment_type=ProductGarmentType.UNKNOWN,
            provider=self.name,
        )


class GeminiProductVisionAdapter(ProductVisionProvider):
    """Adapt the Gemini implementation to the provider contract."""

    def __init__(self) -> None:
        super().__init__(name="gemini-product-vision")
        self._provider = GeminiProductVisionProvider()

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Delegate image understanding to Gemini."""

        return self._provider.analyze(request)


class ProductVisionService:
    """Orchestrate product vision independently from a model vendor."""

    def __init__(self, provider: ProductVisionProvider | None = None) -> None:
        self.provider = provider or self._default_provider()

    @staticmethod
    def _default_provider() -> ProductVisionProvider:
        """Use Gemini when configured; otherwise retain the deterministic stub."""

        if get_settings().gemini_api_key:
            return GeminiProductVisionAdapter()
        return StubProductVisionProvider()

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Analyze a product using the configured vision provider."""

        return normalize_product_attributes(self.provider.analyze(request))
