"""Provider-agnostic models for fashion product vision."""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ProductGarmentType(str, Enum):
    """Normalized garment types used by recommendations and try-on."""

    TOP = "top"
    BOTTOM = "bottom"
    DRESS = "dress"
    OUTERWEAR = "outerwear"
    ACCESSORY = "accessory"
    UNKNOWN = "unknown"


class ProductVisionRequest(BaseModel):
    """Input contract for analyzing one fashion product image."""

    image_url: str = Field(min_length=1)
    product_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ProductVisionResult(BaseModel):
    """Normalized attributes returned by a vision provider."""

    product_id: str | None = None
    garment_type: ProductGarmentType = ProductGarmentType.UNKNOWN
    colors: list[str] = Field(default_factory=list)
    style_tags: list[str] = Field(default_factory=list)
    material: str | None = None
    pattern: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    provider: str
