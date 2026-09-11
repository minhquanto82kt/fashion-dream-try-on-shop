"""Tests for the Gemini Product Vision provider boundary."""

import pytest

from app.core.config import get_settings
from app.models.product_vision import ProductGarmentType, ProductVisionRequest
from app.services.gemini_product_vision_provider import (
    GeminiProductVisionOutput,
    GeminiProductVisionProvider,
)


def test_gemini_output_schema_accepts_catalog_attributes() -> None:
    result = GeminiProductVisionOutput(
        garment_type=ProductGarmentType.TOP,
        colors=["black"],
        style_tags=["streetwear"],
        material="cotton",
        pattern="solid",
        confidence=0.92,
    )

    assert result.garment_type is ProductGarmentType.TOP
    assert result.colors == ["black"]
    assert result.confidence == 0.92


def test_gemini_provider_rejects_non_https_image_urls() -> None:
    with pytest.raises(ValueError, match="HTTPS"):
        GeminiProductVisionProvider._download_image("http://example.com/product.jpg")


def test_gemini_provider_requires_configured_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "")
    get_settings.cache_clear()
    provider = GeminiProductVisionProvider()

    try:
        with pytest.raises(RuntimeError, match="GEMINI_API_KEY"):
            provider._client()
    finally:
        get_settings.cache_clear()


def test_request_contract_is_unchanged() -> None:
    request = ProductVisionRequest(
        image_url="https://example.com/product.jpg",
        product_id="p1",
    )

    assert request.product_id == "p1"
