"""Tests for Product Vision persistence."""

from types import SimpleNamespace

from app.models.product_vision import ProductGarmentType, ProductVisionResult
from app.services.product_vision_repository import ProductVisionRepository


class FakeQuery:
    def __init__(self, data):
        self.data = data
        self.payload = None
        self.filters = {}

    def upsert(self, payload, on_conflict=None):
        self.payload = payload
        self.on_conflict = on_conflict
        return self

    def select(self, _columns):
        return self

    def eq(self, key, value):
        self.filters[key] = value
        return self

    def limit(self, _count):
        return self

    def execute(self):
        return SimpleNamespace(data=[self.data] if self.data else [])


class FakeClient:
    def __init__(self, data=None):
        self.query = FakeQuery(data)

    def table(self, _name):
        return self.query


def test_upsert_maps_normalized_attributes():
    client = FakeClient({"id": "row-1", "product_id": "p-1"})
    repository = ProductVisionRepository(client=client)
    result = ProductVisionResult(
        product_id="p-1",
        garment_type=ProductGarmentType.TOP,
        colors=["black"],
        style_tags=["streetwear"],
        material="cotton",
        pattern="solid",
        confidence=0.91,
        provider="test",
    )

    persisted = repository.upsert(result)

    assert persisted["product_id"] == "p-1"
    assert client.query.payload["garment_type"] == "top"
    assert client.query.payload["colors"] == ["black"]
    assert client.query.on_conflict == "product_id"


def test_get_by_product_id_returns_row():
    row = {"id": "row-1", "product_id": "p-1"}
    repository = ProductVisionRepository(client=FakeClient(row))

    assert repository.get_by_product_id("p-1") == row
