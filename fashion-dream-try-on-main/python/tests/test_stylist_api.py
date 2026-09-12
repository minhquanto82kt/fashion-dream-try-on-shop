"""API contract tests for the protected AI Stylist endpoint."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_stylist_endpoint_requires_authentication() -> None:
    response = client.post(
        "/api/stylist/recommend",
        json={"occasion": "weekend", "mood": "relaxed"},
    )

    assert response.status_code == 401
