"""Unit tests for the FASHN provider without real API calls."""

import httpx
import pytest

from app.core.config import get_settings
from app.models.try_on import TryOnCategory, TryOnRequest
from app.services.fashn_provider import FashnProviderError, FashnTryOnProvider


REQUEST = TryOnRequest(
    person_image_url="https://project.supabase.co/storage/v1/object/sign/try-on/person.webp",
    garment_image_url="https://project.supabase.co/storage/v1/object/sign/try-on/garment.webp",
    category=TryOnCategory.TOP,
)


@pytest.fixture(autouse=True)
def configured_supabase(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_submit_builds_fashn_payload(monkeypatch) -> None:
    captured = {}

    def fake_post(url, *, json, headers, timeout):
        captured.update(url=url, json=json, headers=headers, timeout=timeout)
        return httpx.Response(
            200,
            json={"id": "prediction-123", "error": None},
            request=httpx.Request("POST", url),
        )

    monkeypatch.setattr("app.services.fashn_provider.httpx.post", fake_post)

    prediction = FashnTryOnProvider(api_key="test-key").submit(REQUEST)

    assert prediction.id == "prediction-123"
    assert captured["json"]["model_name"] == "tryon-v1.6"
    assert captured["json"]["inputs"]["category"] == "tops"
    assert captured["headers"]["Authorization"] == "Bearer test-key"


def test_submit_rejects_untrusted_image_host() -> None:
    request = REQUEST.model_copy(update={"person_image_url": "https://example.com/person.webp"})

    with pytest.raises(FashnProviderError, match="Supabase"):
        FashnTryOnProvider(api_key="test-key").submit(request)


def test_submit_requires_api_key() -> None:
    with pytest.raises(FashnProviderError, match="FASHN_API_KEY"):
        FashnTryOnProvider(api_key="").submit(REQUEST)


def test_get_status_returns_payload(monkeypatch) -> None:
    def fake_get(url, *, headers, timeout):
        return httpx.Response(
            200,
            json={"id": "prediction-123", "status": "completed", "output": ["https://example.com/result.png"]},
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr("app.services.fashn_provider.httpx.get", fake_get)

    payload = FashnTryOnProvider(api_key="test-key").get_status("prediction-123")

    assert payload["status"] == "completed"
    assert payload["output"][0].endswith("result.png")
