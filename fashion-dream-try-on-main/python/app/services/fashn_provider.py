"""FASHN API provider for production virtual try-on."""

from dataclasses import dataclass
from typing import Any

import httpx

from app.core.config import get_settings
from app.models.try_on import TryOnCategory, TryOnRequest


class FashnProviderError(Exception):
    """Raised when the FASHN API rejects or cannot complete a request."""


@dataclass(frozen=True)
class FashnPrediction:
    """FASHN prediction identifier and initial response metadata."""

    id: str


class FashnTryOnProvider:
    """Thin provider adapter that keeps FASHN details out of the domain layer."""

    name = "fashn-v1.6"
    run_url = "https://api.fashn.ai/v1/run"
    status_url = "https://api.fashn.ai/v1/status/{prediction_id}"

    def __init__(self, *, api_key: str | None = None, timeout: float = 30.0) -> None:
        self.api_key = api_key or get_settings().fashn_api_key
        self.timeout = timeout

    def submit(self, request: TryOnRequest) -> FashnPrediction:
        """Submit a try-on prediction to FASHN."""
        if not self.api_key:
            raise FashnProviderError("FASHN_API_KEY is not configured")

        payload = {
            "model_name": "tryon-v1.6",
            "inputs": {
                "model_image": request.person_image_url,
                "garment_image": request.garment_image_url,
                "category": self._category(request.category),
            },
        }

        try:
            response = httpx.post(
                self.run_url,
                json=payload,
                headers=self._headers(),
                timeout=self.timeout,
            )
        except httpx.HTTPError as exc:
            raise FashnProviderError("Unable to reach FASHN API") from exc

        if response.status_code >= 400:
            raise FashnProviderError(self._error_message(response))

        body = response.json()
        prediction_id = body.get("id") if isinstance(body, dict) else None
        if not prediction_id:
            raise FashnProviderError("FASHN did not return a prediction id")
        return FashnPrediction(id=str(prediction_id))

    def get_status(self, prediction_id: str) -> dict[str, Any]:
        """Fetch the current status of a FASHN prediction."""
        if not self.api_key:
            raise FashnProviderError("FASHN_API_KEY is not configured")
        if not prediction_id.strip():
            raise ValueError("prediction_id is required")

        try:
            response = httpx.get(
                self.status_url.format(prediction_id=prediction_id),
                headers=self._headers(),
                timeout=self.timeout,
            )
        except httpx.HTTPError as exc:
            raise FashnProviderError("Unable to reach FASHN API") from exc

        if response.status_code >= 400:
            raise FashnProviderError(self._error_message(response))
        body = response.json()
        if not isinstance(body, dict):
            raise FashnProviderError("FASHN returned an invalid status payload")
        return body

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

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
    def _error_message(response: httpx.Response) -> str:
        try:
            body = response.json()
            if isinstance(body, dict) and body.get("error"):
                return str(body["error"])
        except ValueError:
            pass
        return f"FASHN API request failed with status {response.status_code}"
