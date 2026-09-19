"""FastAPI dependencies shared by protected API routes."""

from typing import Annotated, Any

from fastapi import Depends, Header, HTTPException, status

from app.db.supabase import get_supabase_client
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


def get_current_admin(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    """Return the authenticated user when they are registered as an admin."""

    user_id = str(user["id"])
    response = (
        get_supabase_client()
        .table("admin_users")
        .select("user_id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
