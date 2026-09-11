"""Provider-agnostic models for AI Try-On jobs."""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class TryOnStatus(str, Enum):
    """Lifecycle states for a try-on request."""

    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class TryOnCategory(str, Enum):
    """Garment categories supported by the try-on contract."""

    TOP = "top"
    BOTTOM = "bottom"
    DRESS = "dress"
    OUTERWEAR = "outerwear"
    FULL_BODY = "full_body"


class TryOnRequest(BaseModel):
    """Input contract shared by all future try-on providers."""

    person_image_url: str = Field(min_length=1)
    garment_image_url: str = Field(min_length=1)
    category: TryOnCategory = TryOnCategory.TOP
    metadata: dict[str, Any] = Field(default_factory=dict)


class TryOnJob(BaseModel):
    """Stable job representation returned by the API."""

    id: str
    status: TryOnStatus
    provider: str
    result_image_url: str | None = None
    error: str | None = None
