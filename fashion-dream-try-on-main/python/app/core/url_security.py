"""Security helpers for validating server-fetched image URLs."""

from __future__ import annotations

from urllib.parse import urlparse

from app.core.config import get_settings

_ALLOWED_STORAGE_PATH_PREFIXES = (
    "/storage/v1/object/public/",
    "/storage/v1/object/sign/",
    "/storage/v1/object/authenticated/",
)


def is_trusted_image_url(image_url: str) -> bool:
    """Allow only HTTPS image URLs from the configured Supabase Storage project."""
    try:
        parsed = urlparse(image_url)
    except ValueError:
        return False
    if parsed.scheme.lower() != "https" or not parsed.hostname:
        return False
    if parsed.username or parsed.password or parsed.port is not None:
        return False
    supabase_url = get_settings().supabase_url.strip()
    if not supabase_url:
        return False
    try:
        trusted = urlparse(supabase_url)
    except ValueError:
        return False
    trusted_host = trusted.hostname
    if not trusted_host or parsed.hostname.lower() != trusted_host.lower():
        return False
    return parsed.path.startswith(_ALLOWED_STORAGE_PATH_PREFIXES)


def validate_trusted_image_url(image_url: str) -> None:
    """Reject image URLs that could make the backend fetch an unintended resource."""
    if not is_trusted_image_url(image_url):
        raise ValueError("Product image URL must be a trusted Supabase Storage HTTPS object URL")
