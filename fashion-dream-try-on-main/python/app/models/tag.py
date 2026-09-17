"""Admin tag API models."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TagBase(BaseModel):
    """Shared tag fields."""

    name: str = Field(min_length=1, max_length=60)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    status: str = Field(default="active", pattern=r"^(active|archived)$")


class TagCreate(TagBase):
    """Payload for creating a tag."""


class TagUpdate(BaseModel):
    """Payload for updating a tag."""

    name: str | None = Field(default=None, min_length=1, max_length=60)
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    status: str | None = Field(default=None, pattern=r"^(active|archived)$")


class Tag(TagBase):
    """Tag returned to the admin UI."""

    model_config = ConfigDict(extra="ignore")

    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None = None
    product_count: int = 0
