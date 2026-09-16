from unittest.mock import Mock, patch

import pytest

from app.services.try_on_storage_service import TryOnStorageError, TryOnStorageService


def test_persist_provider_result_uploads_private_storage_object() -> None:
    response = Mock(status_code=200)
    response.headers = {"content-type": "image/png"}
    response.content = b"png-bytes"
    storage = Mock()

    with (
        patch("app.services.try_on_storage_service.httpx.Client") as client_cls,
        patch("app.services.try_on_storage_service.get_supabase_client", return_value=storage),
    ):
        client = client_cls.return_value.__enter__.return_value
        client.get.return_value = response

        path = TryOnStorageService().persist_provider_result(
            "job-123", "https://gpu.example.com/result.png"
        )

    assert path == "results/job-123.png"
    client.get.assert_called_once_with("https://gpu.example.com/result.png")
    storage.storage.from_("try-on-assets").upload.assert_called_once_with(
        "results/job-123.png",
        b"png-bytes",
        file_options={"content-type": "image/png", "upsert": "true"},
    )


def test_persist_provider_result_rejects_non_https() -> None:
    with pytest.raises(TryOnStorageError, match="invalid result URL"):
        TryOnStorageService().persist_provider_result("job-123", "http://gpu/result.png")


def test_create_signed_url_returns_supabase_url() -> None:
    storage = Mock()
    storage.storage.from_.return_value.create_signed_url.return_value = {
        "signedURL": "https://example.supabase.co/storage/v1/object/sign/result"
    }

    with patch("app.services.try_on_storage_service.get_supabase_client", return_value=storage):
        signed_url = TryOnStorageService().create_signed_url("results/job-123.png")

    assert signed_url.startswith("https://example.supabase.co/")
