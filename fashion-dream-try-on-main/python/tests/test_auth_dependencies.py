"""Regression tests for centralized authentication dependencies."""

import pytest
from fastapi import HTTPException

from app.api.dependencies import get_current_admin, get_current_user
from app.services.auth_service import AuthenticationError


def test_get_current_user_rejects_missing_bearer_token() -> None:
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(None)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Authentication required"


def test_get_current_user_maps_authentication_errors(monkeypatch) -> None:
    def reject(_token: str):
        raise AuthenticationError("Invalid or expired access token")

    monkeypatch.setattr("app.api.dependencies.get_authenticated_user", reject)

    with pytest.raises(HTTPException) as exc_info:
        get_current_user("Bearer invalid")

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid or expired access token"


def test_get_current_admin_rejects_non_admin(monkeypatch) -> None:
    class Response:
        data = []

    class Query:
        def select(self, *_args):
            return self

        def eq(self, *_args):
            return self

        def limit(self, *_args):
            return self

        def execute(self):
            return Response()

    class Client:
        def table(self, name):
            assert name == "admin_users"
            return Query()

    monkeypatch.setattr("app.api.dependencies.get_supabase_client", lambda: Client())

    with pytest.raises(HTTPException) as exc_info:
        get_current_admin({"id": "user-1"})

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Admin access required"
