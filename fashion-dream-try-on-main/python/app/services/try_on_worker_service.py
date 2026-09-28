"""Database-backed worker for reconciling pending AI Try-On jobs."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.models.try_on import TryOnJob, TryOnStatus
from app.services.try_on_job_service import TryOnJobContext, TryOnJobService
from app.services.try_on_reconciliation_service import TryOnReconciliationService


class TryOnWorkerService:
    """Process the database-backed Try-On queue without an external broker.

    Supabase is the queue/source of truth for the MVP. A scheduled invocation
    calls ``run_once`` and reconciles a bounded number of queued/processing jobs.
    """

    def __init__(self, job_service: TryOnJobService, reconciliation_service: TryOnReconciliationService) -> None:
        self.job_service = job_service
        self.reconciliation_service = reconciliation_service

    def run_once(self, limit: int = 10) -> dict[str, Any]:
        contexts = self.job_service.list_pending_contexts(limit=max(1, min(limit, 50)))
        completed = failed = still_pending = 0
        results: list[dict[str, Any]] = []

        for context in contexts:
            job = self._process(context)
            results.append({"id": job.id, "status": job.status.value, "provider": job.provider})
            if job.status == TryOnStatus.COMPLETED:
                completed += 1
            elif job.status == TryOnStatus.FAILED:
                failed += 1
            else:
                still_pending += 1

        return {
            "processed": len(results),
            "completed": completed,
            "failed": failed,
            "pending": still_pending,
            "jobs": results,
        }

    def _process(self, context: TryOnJobContext) -> TryOnJob:
        metadata = dict(context.metadata)
        attempts = int(metadata.get("worker_attempts", 0)) + 1
        metadata["worker_attempts"] = attempts
        metadata["worker_last_run_at"] = datetime.now(timezone.utc).isoformat()
        self.job_service.update_metadata_internal(context.job.id, metadata)

        if attempts > 120:
            failed = self.job_service.update_status_internal(
                context.job.id,
                status=TryOnStatus.FAILED,
                error="Try-On worker exceeded the retry limit",
            )
            return failed or context.job

        refreshed = TryOnJobContext(job=context.job, metadata=metadata)
        return self.reconciliation_service.refresh(refreshed, internal=True)
