"""Tests for deterministic product attribute normalization."""

from app.models.product_vision import ProductGarmentType, ProductVisionResult
from app.services.product_attribute_service import normalize_product_attributes


def test_normalize_product_attributes() -> None:
    result = normalize_product_attributes(
        ProductVisionResult(
            product_id="p1",
            garment_type=ProductGarmentType.TOP,
            colors=[" Black ", "black", "invalid-color"],
            style_tags=["Streetwear", "unknown-style", "oversized"],
            material="Cotton",
            pattern="Not A Pattern",
            confidence=1.2,
            provider="test",
        )
    )

    assert result.colors == ["black"]
    assert result.style_tags == ["streetwear", "oversized"]
    assert result.material == "cotton"
    assert result.pattern is None
    assert result.confidence == 1.0
