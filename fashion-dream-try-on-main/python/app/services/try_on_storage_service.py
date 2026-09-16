"""Persistent storage for AI Try-On result images."""

from __future__ import annotations

from urllib.parse import urlparse

import httpx

from app.core.config import get_settings
from app.db.supabase import get_supabase_client


class TryOnStorageError(RuntimeError):
    """Raised when a Try-On result cannot be persisted or signed."""


class TryOnStorageService:
    """Move provider output into private Supabase Storage."""

    DEFAULT_BUCKET = "try-on-assets"
    RESULT_PREFIX = "results"
    MAX_RESULT_BYTES = 10 * 1024 * 1024
    SIGNED_URL_SECONDS = 3600

    def persist_provider_result(self, job_id: str, result_url: str) -> str:
        """Download a provider result server-side and persist its storage path."""
        parsed = urlparse(result_url)
        if parsed.scheme != "https" or not parsed.netloc:
            raise TryOnStorageError("Try-On provider returned an invalid result URL")

        try:
            with httpx.Client(follow_redirects=True, timeout=60.0) as client:
                response = client.get(result_url)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise TryOnStorageError("Failed to download Try-On result") from exc

        content_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
        if content_type not in {"image/png", "image/jpeg", "image/webp"}:
            raise TryOnStorageError("Try-On result is not a supported image")
        if len(response.content) > self.MAX_RESULT_BYTES:
            raise TryOnStorageError("Try-On result exceeds the storage size limit")

        path = f"{self.RESULT_PREFIX}/{job_id}.png"
        settings = get_settings()
        bucket = settings.storage_bucket or self.DEFAULT_BUCKET

        try:
            get_supabase_client().storage.from_(bucket).upload(
                path,
                response.content,
                file_options={
                    "content-type": "image/png",
                    "upsert": "true",
                },
            )
        except Exception as exc:
            raise TryOnStorageError("Failed to persist Try-On result in Supabase Storage") from exc

        return path

    def create_signed_url(self, path: str) -> str:
        """Create a short-lived browser URL for a private result object."""
        settings = get_settings()
        bucket = settings.storage_bucket or self.DEFAULT_BUCKET
        try:
            result = get_supabase_client().storage.from_(bucket).create_signed_url(
                path,
                self.SIGNED_URL_SECONDS,
            )
        except Exception as exc:
            raise TryOnStorageError("Failed to create Try-On result URL") from exc

        signed_url = result.get("signedURL") or result.get("signedUrl") if isinstance(result, dict) else None
        if not isinstance(signed_url, str) or not signed_url:
            raise TryOnStorageError("Supabase did not return a signed Try-On result URL")
        return signed_url
