"""Tests for the provider-independent product vision contract."""

from fastapi.testclient import TestClient

from app.main import app
from app.models.product_vision import ProductGarmentType, ProductVisionRequest
from app.services.product_vision_service import StubProductVisionProvider, ProductVisionService


client = TestClient(app)


def test_stub_product_vision_is_explicitly_unknown() -> None:
    result = ProductVisionService(StubProductVisionProvider()).analyze(
        ProductVisionRequest(
            image_url="https://example.com/product.webp",
            product_id="product-1",
        )
    )

    assert result.product_id == "product-1"
    assert result.garment_type == ProductGarmentType.UNKNOWN
    assert result.provider == "stub"
    assert result.confidence is None


def test_product_vision_endpoint() -> None:
    response = client.post(
        "/api/product-vision/analyze",
        json={
            "image_url": "https://example.com/product.webp",
            "product_id": "product-1",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "stub"
    assert response.json()["garment_type"] == "unknown"
