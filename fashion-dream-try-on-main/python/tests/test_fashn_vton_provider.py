from unittest.mock import Mock, patch

import pytest

from app.models.try_on import TryOnCategory, TryOnRequest
from app.services.fashn_vton_provider import (
    FashnVtonLocalProvider,
    FashnVtonProviderError,
)


@pytest.fixture
def request() -> TryOnRequest:
    return TryOnRequest(
        person_image_url="https://example.com/person.jpg",
        garment_image_url="https://example.com/garment.jpg",
        category=TryOnCategory.TOP,
    )


def test_submit_sends_canonical_payload(request: TryOnRequest) -> None:
    response = Mock(status_code=202)
    response.json.return_value = {"id": "gpu-job-123"}
    provider = FashnVtonLocalProvider(
        base_url="https://gpu.example.com/",
        api_key="test-key",
    )

    with patch("app.services.fashn_vton_provider.httpx.post", return_value=response) as post:
        submission = provider.submit(request)

    assert submission.id == "gpu-job-123"
    post.assert_called_once_with(
        "https://gpu.example.com/v1/try-on",
        json={
            "person_image_url": "https://example.com/person.jpg",
            "garment_image_url": "https://example.com/garment.jpg",
            "category": "tops",
        },
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer test-key",
        },
        timeout=30.0,
    )


def test_submit_requires_base_url(request: TryOnRequest) -> None:
    provider = FashnVtonLocalProvider(base_url="")

    with pytest.raises(FashnVtonProviderError, match="LOCAL_TRYON_API_URL"):
        provider.submit(request)


def test_get_status_returns_provider_payload() -> None:
    response = Mock(status_code=200)
    response.json.return_value = {
        "status": "completed",
        "output": ["https://example.com/result.jpg"],
    }
    provider = FashnVtonLocalProvider(base_url="https://gpu.example.com")

    with patch("app.services.fashn_vton_provider.httpx.get", return_value=response) as get:
        payload = provider.get_status("gpu-job-123")

    assert payload["status"] == "completed"
    get.assert_called_once_with(
        "https://gpu.example.com/v1/try-on/gpu-job-123",
        headers={"Content-Type": "application/json"},
        timeout=30.0,
    )
