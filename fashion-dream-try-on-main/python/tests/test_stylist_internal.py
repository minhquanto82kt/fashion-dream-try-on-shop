"""Regression tests for the trusted AI Stylist server bridge."""

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_internal_stylist_requires_server_secret(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.api.stylist_internal.get_settings",
        lambda: type("Settings", (), {"supabase_service_role_key": "expected-secret"})(),
    )

    response = client.post(
        "/api/stylist/internal/recommend",
        json={"preferences": {"style_tags": ["casual"]}},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Internal authentication required"


def test_internal_stylist_accepts_only_matching_server_secret(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.api.stylist_internal.get_settings",
        lambda: type("Settings", (), {"supabase_service_role_key": "expected-secret"})(),
    )
    monkeypatch.setattr(
        "app.api.stylist_internal.ai_rate_limiter.check",
        lambda *_args: None,
    )
    monkeypatch.setattr(
        "app.api.stylist_internal.stylist_service.recommend",
        lambda request: {
            "recommendations": [],
            "summary": "Selected 0 products.",
            "strategy": "stylist-rules-v1",
        },
    )

    response = client.post(
        "/api/stylist/internal/recommend",
        headers={"Authorization": "Bearer expected-secret"},
        json={"preferences": {"style_tags": ["casual"]}},
    )

    assert response.status_code == 200
    assert response.json()["recommendations"] == []
    assert response.json()["strategy"] == "stylist-rules-v1"
