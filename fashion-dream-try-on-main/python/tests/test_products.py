"""Tests for the product API without requiring real Supabase credentials."""

from fastapi.testclient import TestClient

from app.api import products
from app.main import app


client = TestClient(app)


PRODUCTS = [
    {"id": "1", "name": "Product One", "active": True},
    {"id": "2", "name": "Product Two", "active": True},
]


def test_list_products(monkeypatch) -> None:
    monkeypatch.setattr(products, "list_active_products", lambda: PRODUCTS)

    response = client.get("/api/products")

    assert response.status_code == 200
    assert response.json() == PRODUCTS


def test_get_product(monkeypatch) -> None:
    monkeypatch.setattr(products, "get_active_product", lambda product_id: PRODUCTS[0])

    response = client.get("/api/products/1")

    assert response.status_code == 200
    assert response.json() == PRODUCTS[0]


def test_get_product_not_found(monkeypatch) -> None:
    def raise_not_found(_product_id: str):
        raise products.ProductNotFoundError("missing")

    monkeypatch.setattr(products, "get_active_product", raise_not_found)

    response = client.get("/api/products/missing")

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}
