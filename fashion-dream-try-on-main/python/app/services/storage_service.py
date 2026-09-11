"""Private Supabase Storage abstraction for AI Try-On assets."""

from dataclasses import dataclass

from app.core.config import get_settings
from app.db.supabase import get_supabase_client


@dataclass(frozen=True)
class TryOnAssetPath:
    """Canonical storage locations for one try-on job."""

    person: str
    garment: str
    result: str


def build_try_on_asset_paths(user_id: str, job_id: str) -> TryOnAssetPath:
    """Build deterministic, user-scoped paths for a try-on job."""

    safe_user_id = user_id.strip()
    safe_job_id = job_id.strip()
    if not safe_user_id or not safe_job_id:
        raise ValueError("user_id and job_id are required")

    prefix = f"try-on/{safe_user_id}/{safe_job_id}"
    return TryOnAssetPath(
        person=f"{prefix}/person.webp",
        garment=f"{prefix}/garment.webp",
        result=f"{prefix}/result.webp",
    )


def upload_asset(path: str, data: bytes, content_type: str = "image/webp") -> str:
    """Upload an already-validated asset to the private try-on bucket."""

    if not data:
        raise ValueError("Asset is empty")
    if not path.startswith("try-on/"):
        raise ValueError("Invalid try-on asset path")

    bucket = get_settings().storage_bucket or "try-on-assets"
    get_supabase_client().storage.from_(bucket).upload(
        path,
        data,
        {"content-type": content_type, "upsert": False},
    )
    return path


def create_asset_signed_url(path: str, expires_in: int = 300) -> str:
    """Create a short-lived URL for a private try-on asset."""

    if not path.startswith("try-on/"):
        raise ValueError("Invalid try-on asset path")
    if expires_in < 60 or expires_in > 3600:
        raise ValueError("expires_in must be between 60 and 3600 seconds")

    bucket = get_settings().storage_bucket or "try-on-assets"
    response = get_supabase_client().storage.from_(bucket).create_signed_url(
        path,
        expires_in,
    )
    if not response or "signedURL" not in response:
        raise RuntimeError("Supabase did not return a signed URL")
    return response["signedURL"]
