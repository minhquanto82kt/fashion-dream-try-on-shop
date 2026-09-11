"""Tests for the provider-agnostic AI Try-On contract."""

from fastapi.testclient import TestClient

from app.main import app
from app.models.try_on import TryOnCategory, TryOnRequest, TryOnStatus
from app.services.try_on_service import StubTryOnProvider, TryOnService


client = TestClient(app)


def test_stub_provider_creates_queued_job() -> None:
    request = TryOnRequest(
        person_image_url="https://example.com/person.webp",
        garment_image_url="https://example.com/garment.webp",
        category=TryOnCategory.TOP,
    )

    job = TryOnService(StubTryOnProvider()).create_job(request)

    assert job.status == TryOnStatus.QUEUED
    assert job.provider == "stub"
    assert job.result_image_url is None


def test_create_try_on_job_endpoint() -> None:
    response = client.post(
        "/api/try-on/jobs",
        json={
            "person_image_url": "https://example.com/person.webp",
            "garment_image_url": "https://example.com/garment.webp",
            "category": "dress",
        },
    )

    assert response.status_code == 202
    body = response.json()
    assert body["status"] == "queued"
    assert body["provider"] == "stub"
    assert body["id"]
