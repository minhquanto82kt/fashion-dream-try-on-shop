"""Tests for the provider-agnostic AI Try-On contract."""

from fastapi.testclient import TestClient

from app.main import app
from app.models.try_on import TryOnCategory, TryOnRequest, TryOnStatus
from app.services.try_on_job_service import TryOnJobService
from app.services.try_on_service import ProviderSubmission, StubTryOnProvider, TryOnService


client = TestClient(app)


def test_stub_provider_creates_queued_job() -> None:
    request = TryOnRequest(
        person_image_url="https://example.com/person.webp",
        garment_image_url="https://example.com/garment.webp",
        category=TryOnCategory.TOP,
    )

    job, submission = TryOnService(StubTryOnProvider()).create_job(request)

    assert job.status == TryOnStatus.QUEUED
    assert job.provider == "stub"
    assert submission == ProviderSubmission(provider="stub")
    assert job.result_image_url is None


def test_create_try_on_job_requires_authentication() -> None:
    response = client.post(
        "/api/try-on/jobs",
        json={
            "person_image_url": "https://example.com/person.webp",
            "garment_image_url": "https://example.com/garment.webp",
            "category": "dress",
        },
    )

    assert response.status_code == 401


def test_create_try_on_job_endpoint(monkeypatch) -> None:
    app.dependency_overrides.clear()
    from app.api.dependencies import get_current_user

    app.dependency_overrides[get_current_user] = lambda: {"id": "user-123"}

    monkeypatch.setattr(
        "app.api.try_on.job_service",
        FakeTryOnJobService(),
    )
    monkeypatch.setattr(
        "app.api.try_on.provider_service",
        TryOnService(StubTryOnProvider()),
    )

    try:
        response = client.post(
            "/api/try-on/jobs",
            json={
                "person_image_url": "https://example.com/person.webp",
                "garment_image_url": "https://example.com/garment.webp",
                "category": "dress",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 202
    body = response.json()
    assert body["status"] == "queued"
    assert body["provider"] == "stub"
    assert body["id"]


class FakeTryOnJobService(TryOnJobService):
    """In-memory persistence double for the protected endpoint test."""

    def create_job(self, request, *, user_id, provider, job_id, metadata=None):
        return TryOnService(StubTryOnProvider()).create_job(request)[0].model_copy(
            update={"id": job_id, "provider": provider}
        )
