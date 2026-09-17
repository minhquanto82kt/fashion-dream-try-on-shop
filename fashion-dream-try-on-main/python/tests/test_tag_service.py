"""Unit tests for Admin Tags data-service normalization and validation."""

import pytest

from app.services import tag_service


def test_normalize_slug_is_lowercase_and_trimmed():
    assert tag_service._normalize_slug("  AI-TRY-ON ") == "ai-try-on"


def test_normalize_text_collapses_whitespace():
    assert tag_service._normalize_text("  Summer   Collection ") == "Summer Collection"


def test_unique_slug_check_raises_for_existing_tag(monkeypatch):
    class FakeQuery:
        def select(self, *_args):
            return self

        def eq(self, *_args):
            return self

        def neq(self, *_args):
            return self

        def limit(self, *_args):
            return self

        def execute(self):
            return type("Response", (), {"data": [{"id": "existing"}]})()

    class FakeClient:
        def table(self, name):
            assert name == "tags"
            return FakeQuery()

    monkeypatch.setattr(tag_service, "get_supabase_client", lambda: FakeClient())
    with pytest.raises(tag_service.TagConflictError):
        tag_service._ensure_unique("ai-try-on")
