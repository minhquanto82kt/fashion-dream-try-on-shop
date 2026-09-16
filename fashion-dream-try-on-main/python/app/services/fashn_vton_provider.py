"""HTTP adapter for the self-hosted FASHN VTON GPU service.

The GPU service is intentionally kept outside the main application process.
This adapter only handles the server-to-server contract; model inference and
PyTorch dependencies belong to the GPU service.
"""

from dataclasses import dataclass
from typing import Any

import httpx

from app.core.config import get_settings
from app.models.try_on import TryOnCategory, TryOnRequest


class FashnVtonProviderError(Exception):
    """Raised when the self-hosted FASHN VTON service fails."""


@dataclass(frozen=True)
class FashnVtonSubmission:
    """GPU service job identifier returned after submission."""

    id: str


class FashnVtonLocalProvider:
    """Adapter for an external GPU service running FASHN VTON 1.5."""

    name = "fashn-vton-1.5"

    def __init__(
        self,
        *,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        settings = get_settings()
        self.base_url = (base_url or settings.local_tryon_api_url).rstrip("/")
        self.api_key = api_key or settings.local_tryon_api_key
        self.timeout = timeout

    def submit(self, request: TryOnRequest) -> FashnVtonSubmission:
        """Submit a try-on job to the GPU service."""
        if not self.base_url:
            raise FashnVtonProviderError("LOCAL_TRYON_API_URL is not configured")

        payload = {
            "person_image_url": request.person_image_url,
            "garment_image_url": request.garment_image_url,
            "category": self._category(request.category),
        }

        try:
            response = httpx.post(
                f"{self.base_url}/v1/try-on",
                json=payload,
                headers=self._headers(),
                timeout=self.timeout,
            )
        except httpx.HTTPError as exc:
            raise FashnVtonProviderError("Unable to reach local Try-On GPU service") from exc

        if response.status_code >= 400:
            raise FashnVtonProviderError(self._error_message(response))

        body = self._json(response, "GPU service returned invalid submission JSON")
        prediction_id = body.get("id") or body.get("job_id")
        if not isinstance(prediction_id, str) or not prediction_id.strip():
            raise FashnVtonProviderError("GPU service did not return a job id")

        return FashnVtonSubmission(id=prediction_id.strip())

    def get_status(self, prediction_id: str) -> dict[str, Any]:
        """Fetch the current state of a GPU try-on job."""
        if not self.base_url:
            raise FashnVtonProviderError("LOCAL_TRYON_API_URL is not configured")
        if not prediction_id.strip():
            raise ValueError("prediction_id is required")

        try:
            response = httpx.get(
                f"{self.base_url}/v1/try-on/{prediction_id}",
                headers=self._headers(),
                timeout=self.timeout,
            )
        except httpx.HTTPError as exc:
            raise FashnVtonProviderError("Unable to reach local Try-On GPU service") from exc

        if response.status_code >= 400:
            raise FashnVtonProviderError(self._error_message(response))

        return self._json(response, "GPU service returned invalid status JSON")

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    @staticmethod
    def _category(category: TryOnCategory) -> str:
        return {
            TryOnCategory.TOP: "tops",
            TryOnCategory.BOTTOM: "bottoms",
            TryOnCategory.DRESS: "one-pieces",
            TryOnCategory.OUTERWEAR: "tops",
            TryOnCategory.FULL_BODY: "auto",
        }[category]

    @staticmethod
    def _json(response: httpx.Response, message: str) -> dict[str, Any]:
        try:
            body = response.json()
        except ValueError as exc:
            raise FashnVtonProviderError(message) from exc
        if not isinstance(body, dict):
            raise FashnVtonProviderError(message)
        return body

    @staticmethod
    def _error_message(response: httpx.Response) -> str:
        try:
            body = response.json()
            if isinstance(body, dict):
                detail = body.get("detail") or body.get("error")
                if detail:
                    return str(detail)
        except ValueError:
            pass
        return f"GPU Try-On service request failed with status {response.status_code}"
