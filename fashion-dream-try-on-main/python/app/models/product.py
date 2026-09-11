"""Product response models."""

from typing import Any

from pydantic import BaseModel, ConfigDict


class Product(BaseModel):
    """Flexible product model matching the existing Supabase row shape."""

    model_config = ConfigDict(extra="allow")

    id: Any
    name: str
    active: bool = True
