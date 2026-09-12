"""Private Supabase Storage abstraction for AI Try-On assets."""

from dataclasses import dataclass
import re

from app.core.config import get_settings
from app.db.supabase import get_supabase_client


@dataclass(frozen=True)
class TryOnAssetPath:
    """Canonical storage locations for one try-on job."""

    person: str
    garment: str
    result: str


_SAFE_ID = re.compile(r"^[A-Za-z0-9_-]+$")
_SAFE_ASSET_PATH = re.compile(r"^try-on/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+/(person|garment|result)\.webp$")


def build_try_on_asset_paths(user_id: str, job_id: str) -> TryOnAssetPath:
    """Build deterministic, user-scoped paths for one try-on job."""

    safe_user_id = user_id.strip()
    safe_job_id = job_id.strip()
    if not safe_user_id or not safe_job_id:
        raise ValueError("user_id and job_id are required")
    if not _SAFE_ID.fullmatch(safe_user_id) or not _SAFE_ID.fullmatch(safe_job_id):
        raise ValueError("user_id and job_id contain invalid characters")

    prefix = f"try-on/{safe_user_id}/{safe_job_id}"
    return TryOnAssetPath(
        person=f"{prefix}/person.webp",
        garment=f"{prefix}/garment.webp",
        result=f"{prefix}/result.webp",
    )


def _validate_asset_path(path: str) -> None:
    if not _SAFE_ASSET_PATH.fullmatch(path):
        raise ValueError("Invalid try-on asset path")


def upload_asset(path: str, data: bytes, content_type: str = "image/webp") -> str:
    """Upload an already-validated asset to the private try-on bucket."""

    if not data:
        raise ValueError("Asset is empty")
    _validate_asset_path(path)
    if content_type != "image/webp":
        raise ValueError("Try-on assets must use image/webp content type")

    bucket = get_settings().storage_bucket or "try-on-assets"
    try:
        get_supabase_client().storage.from_(bucket).upload(
            path,
            data,
            {"content-type": content_type, "upsert": False},
        )
    except Exception as exc:
        raise RuntimeError("Failed to upload try-on asset") from exc
    return path


def create_asset_signed_url(path: str, expires_in: int = 300) -> str:
    """Create a short-lived URL for a private try-on asset."""

    _validate_asset_path(path)
    if expires_in < 60 or expires_in > 3600:
        raise ValueError("expires_in must be between 60 and 3600 seconds")

    bucket = get_settings().storage_bucket or "try-on-assets"
    try:
        response = get_supabase_client().storage.from_(bucket).create_signed_url(
            path,
            expires_in,
        )
    except Exception as exc:
        raise RuntimeError("Failed to create asset signed URL") from exc
    if not response or "signedURL" not in response:
        raise RuntimeError("Supabase did not return a signed URL")
    return response["signedURL"]
