"""Provider abstraction and orchestration for AI Try-On."""

from dataclasses import dataclass
from uuid import uuid4

from app.core.config import get_settings
from app.models.try_on import TryOnJob, TryOnRequest, TryOnStatus
from app.services.fashn_provider import FashnPrediction, FashnProviderError, FashnTryOnProvider


@dataclass(frozen=True)
class ProviderSubmission:
    """Provider-specific submission reference."""

    provider: str
    prediction_id: str | None = None


class TryOnProvider:
    """Minimal provider contract used by the orchestration service."""

    name: str

    def submit(self, request: TryOnRequest) -> ProviderSubmission:
        """Submit a try-on request to this provider."""

        raise NotImplementedError


class StubTryOnProvider(TryOnProvider):
    """Safe development provider; it never calls an AI model."""

    name = "stub"

    def submit(self, request: TryOnRequest) -> ProviderSubmission:
        """Create a queued reference without performing inference."""

        return ProviderSubmission(provider=self.name)


class FashnProviderAdapter(TryOnProvider):
    """Adapt the FASHN provider to the domain-level provider contract."""

    def __init__(self, provider: FashnTryOnProvider | None = None) -> None:
        self.provider = provider or FashnTryOnProvider()
        self.name = self.provider.name

    def submit(self, request: TryOnRequest) -> ProviderSubmission:
        prediction: FashnPrediction = self.provider.submit(request)
        return ProviderSubmission(
            provider=self.name,
            prediction_id=prediction.id,
        )

    def get_status(self, prediction_id: str) -> dict:
        """Return the latest provider status for a submitted prediction."""

        return self.provider.get_status(prediction_id)


class TryOnService:
    """Orchestrate requests independently of the selected model/provider."""

    def __init__(self, provider: TryOnProvider | None = None) -> None:
        self.provider = provider or self._configured_provider()

    @staticmethod
    def _configured_provider() -> TryOnProvider:
        provider_name = get_settings().try_on_provider.strip().lower()
        if provider_name == "fashn":
            return FashnProviderAdapter()
        return StubTryOnProvider()

    def create_job(self, request: TryOnRequest) -> tuple[TryOnJob, ProviderSubmission]:
        """Submit a request and return a persisted-safe lifecycle state."""

        job_id = str(uuid4())
        try:
            submission = self.provider.submit(request)
        except FashnProviderError as exc:
            return (
                TryOnJob(
                    id=job_id,
                    status=TryOnStatus.FAILED,
                    provider=self.provider.name,
                    error=str(exc),
                ),
                ProviderSubmission(provider=self.provider.name),
            )

        return (
            TryOnJob(
                id=job_id,
                status=TryOnStatus.QUEUED,
                provider=submission.provider,
            ),
            submission,
        )
