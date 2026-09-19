"""Tests for the protected Python Admin Tags API."""

from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.api import admin_tags
from app.api.dependencies import get_current_admin
from app.main import app


NOW = datetime.now(timezone.utc)


def sample_tag(tag_id: str = "11111111-1111-1111-1111-111111111111") -> dict:
    return {
        "id": tag_id,
        "name": "AI Try-On",
        "slug": "ai-try-on",
        "description": "Products supported by virtual try-on.",
        "status": "active",
        "created_by": "22222222-2222-2222-2222-222222222222",
        "created_at": NOW,
        "updated_at": NOW,
        "archived_at": None,
        "product_count": 3,
    }


def override_admin():
    return {"id": "22222222-2222-2222-2222-222222222222"}


def test_list_tags_requires_admin_and_returns_counts(monkeypatch):
    monkeypatch.setattr(admin_tags, "list_tags", lambda status=None: [sample_tag()])
    app.dependency_overrides[get_current_admin] = override_admin
    try:
        response = TestClient(app).get("/api/admin/tags")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["items"][0]["slug"] == "ai-try-on"
    assert response.json()["items"][0]["product_count"] == 3


def test_create_tag_passes_authenticated_admin_id(monkeypatch):
    captured = {}

    def fake_create_tag(**kwargs):
        captured.update(kwargs)
        return sample_tag()

    monkeypatch.setattr(admin_tags, "create_tag", fake_create_tag)
    app.dependency_overrides[get_current_admin] = override_admin
    try:
        response = TestClient(app).post(
            "/api/admin/tags",
            json={"name": "AI Try-On", "slug": "ai-try-on", "description": "Virtual try-on"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    assert captured["created_by"] == "22222222-2222-2222-2222-222222222222"


def test_update_tag_allows_clearing_description(monkeypatch):
    captured = {}

    def fake_update_tag(tag_id, **kwargs):
        captured.update(kwargs)
        return sample_tag()

    monkeypatch.setattr(admin_tags, "update_tag", fake_update_tag)
    app.dependency_overrides[get_current_admin] = override_admin
    try:
        response = TestClient(app).patch(
            "/api/admin/tags/11111111-1111-1111-1111-111111111111",
            json={"description": None},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert captured["description"] is None


def test_invalid_status_is_rejected(monkeypatch):
    app.dependency_overrides[get_current_admin] = override_admin
    try:
        response = TestClient(app).get("/api/admin/tags?status_filter=invalid")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 400
