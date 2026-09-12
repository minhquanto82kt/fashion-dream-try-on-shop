"""Tests for the provider-agnostic AI Try-On contract."""

import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.models.try_on import TryOnCategory, TryOnRequest, TryOnStatus
from app.services.fashn_provider import FashnPrediction, FashnProviderError, FashnTryOnProvider
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
    assert job.error is None


def test_fashn_provider_failure_becomes_failed_job(monkeypatch) -> None:
    request = TryOnRequest(
        person_image_url="https://example.com/person.webp",
        garment_image_url="https://example.com/garment.webp",
        category=TryOnCategory.TOP,
    )

    provider = FailingProvider()
    job, submission = TryOnService(provider).create_job(request)

    assert job.status == TryOnStatus.FAILED
    assert job.provider == "fashn-v1.6"
    assert job.error == "FASHN API timed out"
    assert submission == ProviderSubmission(provider="fashn-v1.6")


def test_fashn_invalid_json_is_provider_error(monkeypatch) -> None:
    provider = FashnTryOnProvider(api_key="test-key")

    def fake_post(*args, **kwargs):
        return httpx.Response(
            200,
            content=b"not-json",
            request=httpx.Request("POST", provider.run_url),
        )

    monkeypatch.setattr("app.services.fashn_provider.httpx.post", fake_post)

    request = TryOnRequest(
        person_image_url="https://example.com/person.webp",
        garment_image_url="https://example.com/garment.webp",
        category=TryOnCategory.TOP,
    )

    try:
        provider.submit(request)
        raise AssertionError("Expected FashnProviderError")
    except FashnProviderError as exc:
        assert str(exc) == "FASHN returned invalid JSON"


def test_fashn_status_requires_object_payload(monkeypatch) -> None:
    provider = FashnTryOnProvider(api_key="test-key")

    def fake_get(*args, **kwargs):
        return httpx.Response(
            200,
            json=["invalid"],
            request=httpx.Request("GET", provider.status_url.format(prediction_id="pred-1")),
        )

    monkeypatch.setattr("app.services.fashn_provider.httpx.get", fake_get)

    try:
        provider.get_status("pred-1")
        raise AssertionError("Expected FashnProviderError")
    except FashnProviderError as exc:
        assert str(exc) == "FASHN returned an invalid status payload"


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


class FailingProvider(StubTryOnProvider):
    """Provider double for network/provider failure handling."""

    name = "fashn-v1.6"

    def submit(self, request: TryOnRequest) -> ProviderSubmission:
        raise FashnProviderError("FASHN API timed out")


class FakeTryOnJobService(TryOnJobService):
    """In-memory persistence double for the protected endpoint test."""

    def create_job(
        self,
        request,
        *,
        user_id,
        provider,
        job_id,
        status=TryOnStatus.QUEUED,
        error=None,
        metadata=None,
    ):
        return TryOnService(StubTryOnProvider()).create_job(request)[0].model_copy(
            update={
                "id": job_id,
                "provider": provider,
                "status": status,
                "error": error,
            }
        )
