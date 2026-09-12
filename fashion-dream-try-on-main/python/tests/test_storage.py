"""Tests for the Try-On storage lifecycle helpers."""

from unittest.mock import Mock, patch

import pytest

from app.services.storage_service import (
    build_try_on_asset_paths,
    create_asset_signed_url,
    upload_asset,
)


def test_build_try_on_asset_paths_is_user_and_job_scoped() -> None:
    paths = build_try_on_asset_paths("user-123", "job-456")
    assert paths.person == "try-on/user-123/job-456/person.webp"
    assert paths.garment == "try-on/user-123/job-456/garment.webp"
    assert paths.result == "try-on/user-123/job-456/result.webp"


def test_build_try_on_asset_paths_requires_ids() -> None:
    with pytest.raises(ValueError):
        build_try_on_asset_paths("", "job-456")
    with pytest.raises(ValueError):
        build_try_on_asset_paths("user-123", "")


def test_build_try_on_asset_paths_rejects_path_injection() -> None:
    with pytest.raises(ValueError):
        build_try_on_asset_paths("../other-user", "job-456")
    with pytest.raises(ValueError):
        build_try_on_asset_paths("user-123", "job/456")


def test_upload_asset_rejects_empty_data() -> None:
    with pytest.raises(ValueError, match="Asset is empty"):
        upload_asset("try-on/user/job/person.webp", b"")


def test_upload_asset_rejects_unscoped_path() -> None:
    with pytest.raises(ValueError, match="Invalid try-on asset path"):
        upload_asset("public/person.webp", b"image")


def test_upload_asset_rejects_path_traversal() -> None:
    with pytest.raises(ValueError, match="Invalid try-on asset path"):
        upload_asset("try-on/user/../other/person.webp", b"image")


def test_upload_asset_rejects_unknown_asset_name() -> None:
    with pytest.raises(ValueError, match="Invalid try-on asset path"):
        upload_asset("try-on/user/job/secret.webp", b"image")


def test_upload_asset_rejects_wrong_content_type() -> None:
    with pytest.raises(ValueError, match="image/webp"):
        upload_asset("try-on/user/job/person.webp", b"image", "image/png")


def test_upload_asset_returns_path_after_successful_upload() -> None:
    client = Mock()
    storage = Mock()
    client.storage.from_.return_value = storage
    with patch("app.services.storage_service.get_supabase_client", return_value=client):
        result = upload_asset("try-on/user/job/person.webp", b"image")
    assert result == "try-on/user/job/person.webp"
    storage.upload.assert_called_once()


def test_signed_url_rejects_unscoped_path() -> None:
    with pytest.raises(ValueError, match="Invalid try-on asset path"):
        create_asset_signed_url("try-on/user/job/secret.webp")


def test_signed_url_requires_safe_expiry() -> None:
    with pytest.raises(ValueError):
        create_asset_signed_url("try-on/user/job/result.webp", 30)
    with pytest.raises(ValueError):
        create_asset_signed_url("try-on/user/job/result.webp", 3601)
