"""Persistence service for AI Try-On jobs."""

from dataclasses import dataclass
from typing import Any

from app.db.supabase import get_supabase_client
from app.models.try_on import TryOnJob, TryOnRequest, TryOnStatus


@dataclass(frozen=True)
class TryOnJobContext:
    """Job model plus provider metadata needed for status polling."""

    job: TryOnJob
    metadata: dict[str, Any]


class TryOnJobService:
    """Persist and retrieve Try-On jobs through Supabase."""

    TABLE = "try_on_jobs"

    def create_job(
        self,
        request: TryOnRequest,
        *,
        user_id: str,
        provider: str,
        job_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> TryOnJob:
        """Persist a newly queued job."""
        row: dict[str, Any] = {
            "id": job_id,
            "user_id": user_id,
            "status": TryOnStatus.QUEUED.value,
            "provider": provider,
            "category": request.category.value,
            "metadata": metadata if metadata is not None else request.metadata,
        }
        response = self._table().insert(row).execute()
        if not response.data:
            raise RuntimeError("Failed to persist try-on job")
        return self._to_model(response.data[0])

    def get_job(self, job_id: str, *, user_id: str) -> TryOnJob | None:
        """Return a job owned by the supplied user."""
        context = self.get_job_context(job_id, user_id=user_id)
        return context.job if context else None

    def get_job_context(self, job_id: str, *, user_id: str) -> TryOnJobContext | None:
        """Return a job and its provider metadata when owned by the user."""
        response = (
            self._table()
            .select("*")
            .eq("id", job_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        row = response.data[0]
        metadata = row.get("metadata") or {}
        return TryOnJobContext(
            job=self._to_model(row),
            metadata=metadata if isinstance(metadata, dict) else {},
        )

    def update_status(
        self,
        job_id: str,
        *,
        user_id: str,
        status: TryOnStatus,
        result_image_path: str | None = None,
        error: str | None = None,
    ) -> TryOnJob | None:
        """Update job lifecycle state for its owner."""
        changes: dict[str, Any] = {
            "status": status.value,
            "error": error,
        }
        if result_image_path is not None:
            changes["result_image_path"] = result_image_path
        response = (
            self._table()
            .update(changes)
            .eq("id", job_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not response.data:
            return None
        return self._to_model(response.data[0])

    def _table(self):
        return get_supabase_client().table(self.TABLE)

    @staticmethod
    def _to_model(row: dict[str, Any]) -> TryOnJob:
        return TryOnJob(
            id=str(row["id"]),
            status=TryOnStatus(row["status"]),
            provider=row["provider"],
            result_image_url=row.get("result_image_path"),
            error=row.get("error"),
        )
