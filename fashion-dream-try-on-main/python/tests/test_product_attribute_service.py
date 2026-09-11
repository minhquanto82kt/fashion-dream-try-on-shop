"""Tests for deterministic product attribute normalization."""

import pytest

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
            confidence=0.94,
            provider="test",
        )
    )

    assert result.colors == ["black"]
    assert result.style_tags == ["streetwear", "oversized"]
    assert result.material == "cotton"
    assert result.pattern is None
    assert result.confidence == 0.94


def test_product_vision_result_rejects_out_of_range_confidence() -> None:
    with pytest.raises(ValueError):
        ProductVisionResult(
            product_id="p1",
            confidence=1.2,
            provider="test",
        )
