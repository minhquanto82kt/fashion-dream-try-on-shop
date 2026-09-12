"""Tests for server-side image URL allowlisting."""

import pytest

from app.core.config import get_settings
from app.core.url_security import is_trusted_image_url, validate_trusted_image_url


def test_storage_object_url_is_trusted(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    get_settings.cache_clear()

    try:
        url = "https://project.supabase.co/storage/v1/object/sign/try-on/person.webp?token=test"
        assert is_trusted_image_url(url)
        validate_trusted_image_url(url)
    finally:
        get_settings.cache_clear()


def test_external_host_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    get_settings.cache_clear()

    try:
        assert not is_trusted_image_url("https://example.com/storage/v1/object/sign/try-on/person.webp")
        with pytest.raises(ValueError, match="Supabase Storage"):
            validate_trusted_image_url("https://example.com/storage/v1/object/sign/try-on/person.webp")
    finally:
        get_settings.cache_clear()


def test_non_storage_path_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    get_settings.cache_clear()

    try:
        assert not is_trusted_image_url("https://project.supabase.co/auth/v1/user")
    finally:
        get_settings.cache_clear()
