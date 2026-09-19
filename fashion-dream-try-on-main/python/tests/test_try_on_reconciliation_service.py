"""Tests for provider-to-database Try-On reconciliation."""

from app.models.try_on import TryOnJob, TryOnStatus
from app.services.try_on_job_service import TryOnJobContext
from app.services.try_on_reconciliation_service import TryOnReconciliationService


class FakeProvider:
    def get_status(self, prediction_id: str) -> dict:
        assert prediction_id == "pred-1"
        return {"status": "completed", "output": ["https://provider.example/result.webp"]}


class FakeProviderService:
    def provider_for_name(self, name: str):
        assert name == "fashn"
        return FakeProvider()


class FakeStorage:
    def persist_provider_result(self, job_id: str, candidate: str) -> str:
        assert job_id == "job-1"
        assert candidate == "https://provider.example/result.webp"
        return "try-on/job-1.webp"


class FakeJobService:
    def __init__(self) -> None:
        self.updated = None

    def update_status(self, job_id: str, *, user_id: str, status: TryOnStatus, result_image_path=None, error=None):
        self.updated = {
            "job_id": job_id,
            "user_id": user_id,
            "status": status,
            "result_image_path": result_image_path,
            "error": error,
        }
        return TryOnJob(
            id=job_id,
            status=status,
            provider="fashn",
            result_image_url=result_image_path,
            error=error,
        )


def test_completed_provider_result_is_persisted_and_job_updated() -> None:
    job_service = FakeJobService()
    service = TryOnReconciliationService(job_service, FakeProviderService(), FakeStorage())
    context = TryOnJobContext(
        job=TryOnJob(id="job-1", status=TryOnStatus.PROCESSING, provider="fashn"),
        metadata={"provider_prediction_id": "pred-1"},
    )

    result = service.refresh(context, user_id="user-1")

    assert result.status is TryOnStatus.COMPLETED
    assert result.result_image_url == "try-on/job-1.webp"
    assert job_service.updated["user_id"] == "user-1"
    assert job_service.updated["status"] is TryOnStatus.COMPLETED


def test_missing_prediction_id_is_a_noop() -> None:
    job_service = FakeJobService()
    service = TryOnReconciliationService(job_service, FakeProviderService(), FakeStorage())
    context = TryOnJobContext(
        job=TryOnJob(id="job-1", status=TryOnStatus.QUEUED, provider="fashn"),
        metadata={},
    )

    result = service.refresh(context, user_id="user-1")

    assert result == context.job
    assert job_service.updated is None
