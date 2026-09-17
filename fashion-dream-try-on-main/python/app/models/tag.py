"""Pydantic models for admin catalog tags."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


TagStatus = Literal["active", "archived"]


class Tag(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: UUID
    name: str
    slug: str
    description: str | None = None
    status: TagStatus
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None = None
    product_count: int = Field(default=0, ge=0)


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None


class TagUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=60)
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    status: TagStatus | None = None
