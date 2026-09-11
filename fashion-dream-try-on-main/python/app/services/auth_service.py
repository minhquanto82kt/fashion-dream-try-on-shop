"""Supabase Auth token verification for the Python backend."""

from typing import Any

import httpx

from app.core.config import get_settings


class AuthenticationError(Exception):
    """Raised when a Supabase access token cannot be verified."""


def get_authenticated_user(access_token: str) -> dict[str, Any]:
    """Verify a customer access token through Supabase Auth."""

    token = access_token.strip()
    if not token:
        raise AuthenticationError("Missing access token")

    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise AuthenticationError("Supabase authentication is not configured")

    try:
        response = httpx.get(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {token}",
            },
            timeout=10.0,
        )
    except httpx.HTTPError as exc:
        raise AuthenticationError("Unable to reach Supabase Auth") from exc

    if response.status_code != 200:
        raise AuthenticationError("Invalid or expired access token")

    user = response.json()
    if not isinstance(user, dict) or not user.get("id"):
        raise AuthenticationError("Supabase returned an invalid user")
    return user
