"""Provider abstraction for AI Try-On inference."""

from dataclasses import dataclass
from uuid import uuid4

from app.models.try_on import TryOnJob, TryOnRequest, TryOnStatus


@dataclass(frozen=True)
class TryOnProvider:
    """Minimal provider contract used by the orchestration service."""

    name: str

    def submit(self, request: TryOnRequest) -> TryOnJob:
        """Submit a try-on request to this provider."""

        raise NotImplementedError


class StubTryOnProvider(TryOnProvider):
    """Safe development provider; it never calls an AI model."""

    def __init__(self) -> None:
        super().__init__(name="stub")

    def submit(self, request: TryOnRequest) -> TryOnJob:
        """Create a queued job without performing inference."""

        return TryOnJob(
            id=str(uuid4()),
            status=TryOnStatus.QUEUED,
            provider=self.name,
        )


class TryOnService:
    """Orchestrate requests independently of the selected model/provider."""

    def __init__(self, provider: TryOnProvider | None = None) -> None:
        self.provider = provider or StubTryOnProvider()

    def create_job(self, request: TryOnRequest) -> TryOnJob:
        """Create a try-on job using the configured provider."""

        return self.provider.submit(request)
