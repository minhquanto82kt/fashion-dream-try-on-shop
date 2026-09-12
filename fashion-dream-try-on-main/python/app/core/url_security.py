"""Security helpers for validating server-fetched image URLs."""

from __future__ import annotations

from urllib.parse import urlparse

from app.core.config import get_settings


def is_trusted_image_url(image_url: str) -> bool:
    """Allow only HTTPS URLs hosted by the configured Supabase project."""

    parsed = urlparse(image_url)
    if parsed.scheme != "https" or not parsed.hostname:
        return False

    supabase_url = get_settings().supabase_url.strip()
    trusted_host = urlparse(supabase_url).hostname if supabase_url else None
    return bool(trusted_host and parsed.hostname.lower() == trusted_host.lower())


def validate_trusted_image_url(image_url: str) -> None:
    """Reject image URLs that could make the backend fetch an arbitrary host."""

    if not is_trusted_image_url(image_url):
        raise ValueError("Product image URL must use the configured Supabase HTTPS host")
