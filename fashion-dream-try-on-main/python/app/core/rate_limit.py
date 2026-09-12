"""Lightweight per-user rate limiting for expensive AI endpoints."""

from __future__ import annotations

from collections import defaultdict, deque
from threading import Lock
import time


class RateLimitExceeded(Exception):
    """Raised when a caller exceeds an endpoint's request budget."""


class InMemoryRateLimiter:
    """Small process-local limiter suitable for MVP protection.

    This is intentionally dependency-free. It limits bursts on each backend
    instance; a distributed limiter can replace this later without changing
    endpoint contracts.
    """

    def __init__(self) -> None:
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            timestamps = self._requests[key]
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()
            if len(timestamps) >= limit:
                raise RateLimitExceeded
            timestamps.append(now)

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()


ai_rate_limiter = InMemoryRateLimiter()

# Conservative MVP limits for expensive AI operations.
TRY_ON_REQUESTS = 10
TRY_ON_WINDOW_SECONDS = 60
PRODUCT_VISION_REQUESTS = 20
PRODUCT_VISION_WINDOW_SECONDS = 60
RECOMMENDATION_REQUESTS = 30
RECOMMENDATION_WINDOW_SECONDS = 60
STYLIST_REQUESTS = 30
STYLIST_WINDOW_SECONDS = 60
