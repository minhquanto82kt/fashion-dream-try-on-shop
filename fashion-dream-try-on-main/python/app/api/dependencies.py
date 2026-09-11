"""FastAPI dependencies shared by protected API routes."""

from typing import Annotated, Any

from fastapi import Depends, Header, HTTPException, status

from app.services.auth_service import AuthenticationError, get_authenticated_user


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict[str, Any]:
    """Return the Supabase Auth user represented by the Bearer token."""

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token = authorization[7:].strip()
    try:
        return get_authenticated_user(token)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
