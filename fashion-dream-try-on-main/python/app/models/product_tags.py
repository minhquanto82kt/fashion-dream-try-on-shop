"""Models for product/tag relationships in the admin catalog."""

from pydantic import BaseModel, Field


class ProductTagItem(BaseModel):
    id: str
    name: str
    slug: str
    status: str


class ProductTagsResponse(BaseModel):
    product_id: str
    tags: list[ProductTagItem]


class ProductTagsUpdate(BaseModel):
    tag_ids: list[str] = Field(default_factory=list)
