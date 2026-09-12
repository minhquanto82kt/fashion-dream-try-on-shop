"""Security helpers for validating server-fetched image URLs."""

from __future__ import annotations

from urllib.parse import urlparse

from app.core.config import get_settings


def is_trusted_image_url(image_url: str) -> bool:
    """Allow only HTTPS Supabase Storage object URLs from the configured project."""

    parsed = urlparse(image_url)
    if parsed.scheme != "https" or not parsed.hostname:
        return False

    supabase_url = get_settings().supabase_url.strip()
    trusted_host = urlparse(supabase_url).hostname if supabase_url else None
    if not trusted_host or parsed.hostname.lower() != trusted_host.lower():
        return False

    return parsed.path.startswith("/storage/v1/object/")


def validate_trusted_image_url(image_url: str) -> None:
    """Reject image URLs that could make the backend fetch an unintended resource."""

    if not is_trusted_image_url(image_url):
        raise ValueError("Product image URL must be a Supabase Storage HTTPS object URL")
