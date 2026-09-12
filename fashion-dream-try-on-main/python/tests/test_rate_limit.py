"""Tests for the lightweight AI rate limiter."""

import pytest

from app.core.rate_limit import InMemoryRateLimiter, RateLimitExceeded


def test_rate_limiter_allows_requests_up_to_limit() -> None:
    limiter = InMemoryRateLimiter()

    limiter.check("user-1", limit=2, window_seconds=60)
    limiter.check("user-1", limit=2, window_seconds=60)


def test_rate_limiter_rejects_requests_over_limit() -> None:
    limiter = InMemoryRateLimiter()
    limiter.check("user-1", limit=1, window_seconds=60)

    with pytest.raises(RateLimitExceeded):
        limiter.check("user-1", limit=1, window_seconds=60)


def test_rate_limiter_is_scoped_per_user() -> None:
    limiter = InMemoryRateLimiter()
    limiter.check("user-1", limit=1, window_seconds=60)
    limiter.check("user-2", limit=1, window_seconds=60)


def test_rate_limiter_reset_clears_state() -> None:
    limiter = InMemoryRateLimiter()
    limiter.check("user-1", limit=1, window_seconds=60)
    limiter.reset()
    limiter.check("user-1", limit=1, window_seconds=60)
