"""Provider-to-database reconciliation for AI Try-On jobs.

The reconciliation logic is intentionally separate from the HTTP layer so the
same operation can later be invoked by a background worker or scheduled job.
"""

from typing import Any

from app.models.try_on import TryOnJob, TryOnStatus
from app.services.fashn_provider import FashnProviderError
from app.services.fashn_vton_provider import FashnVtonProviderError
from app.services.try_on_job_service import TryOnJobContext, TryOnJobService
from app.services.try_on_service import TryOnService
from app.services.try_on_storage_service import TryOnStorageError, TryOnStorageService


class TryOnReconciliationService:
    """Synchronize a persisted Try-On job with its external provider."""

    def __init__(
        self,
        job_service: TryOnJobService,
        provider_service: TryOnService,
        storage_service: TryOnStorageService,
    ) -> None:
        self.job_service = job_service
        self.provider_service = provider_service
        self.storage_service = storage_service

    def refresh(self, context: TryOnJobContext, *, user_id: str) -> TryOnJob:
        """Fetch provider state and persist the resulting job lifecycle state."""

        job = context.job
        prediction_id = context.metadata.get("provider_prediction_id")
        if not isinstance(prediction_id, str) or not prediction_id.strip():
            return job

        try:
            provider = self.provider_service.provider_for_name(job.provider)
            payload = provider.get_status(prediction_id)
        except ValueError as exc:
            return self._fail(job.id, user_id, str(exc))
        except (FashnProviderError, FashnVtonProviderError) as exc:
            failed = self.job_service.update_status(
                job.id,
                user_id=user_id,
                status=TryOnStatus.FAILED,
                error=str(exc),
            )
            return failed or job

        provider_status = str(payload.get("status", "")).strip().lower()
        if not provider_status:
            return self._fail(job.id, user_id, "Try-On provider returned an invalid status payload")

        mapped_status = {
            "starting": TryOnStatus.PROCESSING,
            "in_queue": TryOnStatus.PROCESSING,
            "queued": TryOnStatus.QUEUED,
            "processing": TryOnStatus.PROCESSING,
            "completed": TryOnStatus.COMPLETED,
            "failed": TryOnStatus.FAILED,
            "canceled": TryOnStatus.FAILED,
            "cancelled": TryOnStatus.FAILED,
        }.get(provider_status)
        if mapped_status is None:
            return job

        result_path: str | None = None
        if mapped_status == TryOnStatus.COMPLETED:
            try:
                result_path = self._persist_result(job.id, payload)
            except TryOnStorageError as exc:
                return self._fail(job.id, user_id, str(exc))
            if result_path is None:
                return self._fail(job.id, user_id, "Try-On provider completed without a valid output image")

        error = payload.get("error") if mapped_status == TryOnStatus.FAILED else None
        if mapped_status == TryOnStatus.FAILED and not error:
            error = "Try-On provider prediction failed"

        updated = self.job_service.update_status(
            job.id,
            user_id=user_id,
            status=mapped_status,
            result_image_path=result_path,
            error=str(error) if error else None,
        )
        return updated or job

    def _persist_result(self, job_id: str, payload: dict[str, Any]) -> str | None:
        output = payload.get("output")
        candidate = output[0] if isinstance(output, list) and output else output
        if not isinstance(candidate, str) or not candidate.strip():
            return None
        return self.storage_service.persist_provider_result(job_id, candidate.strip())

    def _fail(self, job_id: str, user_id: str, error: str) -> TryOnJob:
        failed = self.job_service.update_status(
            job_id,
            user_id=user_id,
            status=TryOnStatus.FAILED,
            error=error,
        )
        if failed is None:
            raise RuntimeError(error)
        return failed
