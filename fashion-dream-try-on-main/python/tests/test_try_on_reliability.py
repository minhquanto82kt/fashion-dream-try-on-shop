from datetime import datetime, timedelta, timezone

import pytest

from app.api.try_on_internal import MAX_POLL_ATTEMPTS, MAX_POLL_AGE_SECONDS, _map_provider_status, _poll_metadata
from app.models.try_on import TryOnStatus


def test_provider_status_mapping_is_explicit():
    assert _map_provider_status("starting") == TryOnStatus.PROCESSING
    assert _map_provider_status("in_queue") == TryOnStatus.PROCESSING
    assert _map_provider_status("queued") == TryOnStatus.QUEUED
    assert _map_provider_status("processing") == TryOnStatus.PROCESSING
    assert _map_provider_status("completed") == TryOnStatus.COMPLETED
    assert _map_provider_status("failed") == TryOnStatus.FAILED
    assert _map_provider_status("cancelled") == TryOnStatus.FAILED
    assert _map_provider_status("unexpected") is None


def test_poll_metadata_increments_attempts_and_timestamps():
    metadata, attempts = _poll_metadata({"poll_attempts": 2})

    assert attempts == 3
    assert metadata["poll_attempts"] == 3
    assert "poll_started_at" in metadata
    assert "last_polled_at" in metadata


def test_poll_metadata_rejects_max_attempts():
    with pytest.raises(TimeoutError, match="polling reliability limit"):
        _poll_metadata({"poll_attempts": MAX_POLL_ATTEMPTS})


def test_poll_metadata_rejects_stale_started_at():
    stale = (datetime.now(timezone.utc) - timedelta(seconds=MAX_POLL_AGE_SECONDS + 1)).isoformat()

    with pytest.raises(TimeoutError, match="polling reliability limit"):
        _poll_metadata({"poll_attempts": 0, "poll_started_at": stale})
