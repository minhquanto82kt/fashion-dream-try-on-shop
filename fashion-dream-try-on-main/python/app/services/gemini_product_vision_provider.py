"""Gemini multimodal provider for fashion product image understanding."""

from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse

import httpx
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.models.product_vision import ProductGarmentType, ProductVisionRequest, ProductVisionResult


class GeminiProductVisionOutput(BaseModel):
    """Strict structured output requested from Gemini."""

    garment_type: ProductGarmentType = Field(description="Primary garment type visible in the product image.")
    colors: list[str] = Field(default_factory=list, description="Dominant garment colors in lowercase English.")
    style_tags: list[str] = Field(default_factory=list, description="Applicable normalized fashion style tags.")
    material: str | None = Field(default=None, description="Best-supported garment material, or null when uncertain.")
    pattern: str | None = Field(default=None, description="Best-supported garment pattern, or null when uncertain.")
    confidence: float = Field(ge=0, le=1, description="Confidence from 0 to 1 for the overall classification.")


ALLOWED_COLORS = {
    "black", "white", "gray", "grey", "brown", "beige", "cream", "navy",
    "blue", "light-blue", "green", "olive", "yellow", "orange", "red",
    "pink", "purple", "burgundy", "multi-color",
}

ALLOWED_STYLES = {
    "minimal", "casual", "streetwear", "smart-casual", "formal", "sporty",
    "vintage", "preppy", "workwear", "utility", "oversized", "tailored",
    "feminine", "masculine", "unisex",
}

ALLOWED_MATERIALS = {
    "cotton", "linen", "denim", "wool", "leather", "silk", "polyester",
    "nylon", "knit", "canvas",
}

ALLOWED_PATTERNS = {
    "solid", "striped", "checked", "plaid", "floral", "graphic", "logo",
    "geometric", "camo", "animal-print",
}


@dataclass(frozen=True)
class GeminiProductVisionProvider:
    """Analyze product images with Gemini while keeping the vendor behind the provider contract."""

    name: str = "gemini-product-vision"

    def _client(self) -> genai.Client:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise RuntimeError("Gemini is not configured. Set GEMINI_API_KEY in python/.env.")
        return genai.Client(api_key=settings.gemini_api_key)

    @staticmethod
    def _download_image(image_url: str) -> tuple[bytes, str]:
        parsed = urlparse(image_url)
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError("Product image URL must be a valid HTTPS URL")

        with httpx.Client(timeout=30.0, follow_redirects=True) as client:
            response = client.get(image_url)
            response.raise_for_status()

        mime_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
        if mime_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise ValueError("Product image must be JPEG, PNG, or WebP")
        if not response.content:
            raise ValueError("Product image is empty")
        if len(response.content) > 10 * 1024 * 1024:
            raise ValueError("Product image exceeds the 10 MB limit")

        return response.content, mime_type

    @staticmethod
    def _prompt() -> str:
        return """Analyze this fashion product image for an e-commerce catalog.

Return only the requested structured fields.

Rules:
- Identify the main garment, not the background or model styling.
- Use garment_type only from: top, bottom, dress, outerwear, accessory, unknown.
- Use only these color labels: black, white, gray, grey, brown, beige, cream, navy, blue, light-blue, green, olive, yellow, orange, red, pink, purple, burgundy, multi-color.
- Use only these style tags: minimal, casual, streetwear, smart-casual, formal, sporty, vintage, preppy, workwear, utility, oversized, tailored, feminine, masculine, unisex.
- Use only these materials: cotton, linen, denim, wool, leather, silk, polyester, nylon, knit, canvas. Use null when uncertain.
- Use only these patterns: solid, striped, checked, plaid, floral, graphic, logo, geometric, camo, animal-print. Use null when uncertain.
- Do not invent an attribute that cannot reasonably be supported by the image.
- Confidence must reflect the certainty of the overall classification.
"""

    def analyze(self, request: ProductVisionRequest) -> ProductVisionResult:
        """Download one product image, analyze it, and return normalized model output."""

        image_bytes, mime_type = self._download_image(request.image_url)
        settings = get_settings()
        response = self._client().models.generate_content(
            model=settings.gemini_product_vision_model,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                self._prompt(),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiProductVisionOutput,
                temperature=0,
            ),
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty Product Vision response")

        output = GeminiProductVisionOutput.model_validate_json(response.text)
        colors = [value.strip().lower() for value in output.colors if value.strip().lower() in ALLOWED_COLORS]
        styles = [value.strip().lower() for value in output.style_tags if value.strip().lower() in ALLOWED_STYLES]
        material = output.material.strip().lower() if output.material else None
        pattern = output.pattern.strip().lower() if output.pattern else None

        return ProductVisionResult(
            product_id=request.product_id,
            garment_type=output.garment_type,
            colors=list(dict.fromkeys(colors)),
            style_tags=list(dict.fromkeys(styles)),
            material=material if material in ALLOWED_MATERIALS else None,
            pattern=pattern if pattern in ALLOWED_PATTERNS else None,
            confidence=output.confidence,
            provider=self.name,
        )
