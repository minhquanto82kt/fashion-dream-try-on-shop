"""Internal Try-On bridge for the same-origin TanStack server functions."""

from base64 import b64decode, binascii
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.rate_limit import TRY_ON_REQUESTS, TRY_ON_WINDOW_SECONDS, RateLimitExceeded, ai_rate_limiter
from app.models.try_on import TryOnCategory, TryOnJob, TryOnRequest, TryOnStatus
from app.services.fashn_provider import FashnProviderError
from app.services.fashn_vton_provider import FashnVtonProviderError
from app.services.try_on_job_service import TryOnJobService
from app.services.try_on_service import TryOnService
from app.services.try_on_storage_service import TryOnStorageError, TryOnStorageService
from app.services.image_service import normalize_image

router = APIRouter(prefix="/api/try-on/internal", tags=["try-on-internal"])
job_service = TryOnJobService()
provider_service = TryOnService()
storage_service = TryOnStorageService()


class InternalTryOnInput(BaseModel):
    """Input accepted only by the trusted same-origin server bridge."""

    person_image: str = Field(min_length=20, max_length=8_500_000)
    garment_image_url: str = Field(min_length=1, max_length=4000)
    category: TryOnCategory = TryOnCategory.TOP
    note: str | None = Field(default=None, max_length=400)
    client_key: str = Field(default="unknown", min_length=1, max_length=200)


def _require_internal_secret(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    """Allow only the server-side application bridge to call this API."""

    expected = get_settings().supabase_service_role_key.strip()
    supplied = authorization[7:].strip() if authorization and authorization.lower().startswith("bearer ") else ""
    if not expected or not supplied or supplied != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Internal authentication required")


def _decode_data_url(data_url: str) -> tuple[bytes, str]:
    """Decode a browser image data URL into bytes and its declared MIME type."""

    prefix, separator, encoded = data_url.partition(",")
    if not separator or not prefix.startswith("data:image/") or ";base64" not in prefix:
        raise HTTPException(status_code=400, detail="Ảnh người dùng phải là data URL base64 hợp lệ")

    content_type = prefix[5:].split(";", 1)[0].lower()
    if content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ JPG, PNG hoặc WEBP")

    try:
        return b64decode(encoded, validate=True), content_type
    except (ValueError, binascii.Error) as exc:
        raise HTTPException(status_code=400, detail="Dữ liệu ảnh không hợp lệ") from exc


@router.post("/jobs", response_model=TryOnJob, status_code=202, dependencies=[Depends(_require_internal_secret)])
def create_internal_try_on_job(request: InternalTryOnInput) -> TryOnJob:
    """Persist the customer input, submit the provider job and return its initial state."""

    try:
        ai_rate_limiter.check(request.client_key, TRY_ON_REQUESTS, TRY_ON_WINDOW_SECONDS)
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many Try-On requests. Please wait before trying again.",
            headers={"Retry-After": str(TRY_ON_WINDOW_SECONDS)},
        ) from exc

    raw_data, content_type = _decode_data_url(request.person_image)
    try:
        normalized, _metadata = normalize_image(raw_data, content_type)
        person_path, person_url = storage_service.persist_input_image(normalized)
    except (ValueError, TryOnStorageError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        provider_request = TryOnRequest(
            person_image_url=person_url,
            garment_image_url=request.garment_image_url,
            category=request.category,
            metadata={"note": request.note} if request.note else {},
        )
        job, submission = provider_service.create_job(provider_request)
        metadata: dict[str, Any] = {
            "person_image_path": person_path,
            "garment_image_url": request.garment_image_url,
        }
        if request.note:
            metadata["note"] = request.note
        if submission.prediction_id:
            metadata["provider_prediction_id"] = submission.prediction_id

        return job_service.create_job(
            provider_request,
            user_id=None,
            provider=job.provider,
            job_id=job.id,
            status=job.status,
            error=job.error,
            metadata=metadata,
        )
    except (FashnProviderError, FashnVtonProviderError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/jobs/{job_id}", response_model=TryOnJob, dependencies=[Depends(_require_internal_secret)])
def get_internal_try_on_job(job_id: str) -> TryOnJob:
    """Return the latest provider-backed state for the trusted server bridge."""

    context = job_service.get_job_context_internal(job_id)
    if context is None:
        raise HTTPException(status_code=404, detail="Try-on job not found")

    job = context.job
    if job.status in {TryOnStatus.COMPLETED, TryOnStatus.FAILED}:
        if job.status == TryOnStatus.COMPLETED:
            return _with_signed_result(job)
        return job

    prediction_id = context.metadata.get("provider_prediction_id")
    if not isinstance(prediction_id, str) or not prediction_id.strip():
        return job

    try:
        provider = provider_service.provider_for_name(job.provider)
        payload = provider.get_status(prediction_id)
    except ValueError as exc:
        return _fail_internal_job(job_id, str(exc))
    except (FashnProviderError, FashnVtonProviderError) as exc:
        failed = job_service.update_status_internal(job_id, status=TryOnStatus.FAILED, error=str(exc))
        return failed or job

    provider_status = str(payload.get("status", "")).strip().lower()
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
        return _fail_internal_job(job_id, "Try-On provider returned an invalid status") if not provider_status else job

    result_path = None
    if mapped_status == TryOnStatus.COMPLETED:
        output = payload.get("output")
        candidate = output[0] if isinstance(output, list) and output else output
        if not isinstance(candidate, str) or not candidate.strip():
            return _fail_internal_job(job_id, "Try-On provider completed without a valid output image")
        try:
            result_path = storage_service.persist_provider_result(job_id, candidate.strip())
        except TryOnStorageError as exc:
            return _fail_internal_job(job_id, str(exc))

    error = payload.get("error") if mapped_status == TryOnStatus.FAILED else None
    if mapped_status == TryOnStatus.FAILED and not error:
        error = "Try-On provider prediction failed"

    updated = job_service.update_status_internal(
        job_id,
        status=mapped_status,
        result_image_path=result_path,
        error=str(error) if error else None,
    )
    if updated is None:
        return job
    return _with_signed_result(updated) if mapped_status == TryOnStatus.COMPLETED else updated


def _with_signed_result(job: TryOnJob) -> TryOnJob:
    if not job.result_image_url:
        return job
    try:
        signed_url = storage_service.create_signed_url(job.result_image_url)
    except TryOnStorageError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return job.model_copy(update={"result_image_url": signed_url})


def _fail_internal_job(job_id: str, error: str) -> TryOnJob:
    failed = job_service.update_status_internal(job_id, status=TryOnStatus.FAILED, error=error)
    if failed is None:
        raise HTTPException(status_code=502, detail=error)
    return failed
