"""AI Try-On job endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.core.rate_limit import (
    TRY_ON_REQUESTS,
    TRY_ON_WINDOW_SECONDS,
    RateLimitExceeded,
    ai_rate_limiter,
)
from app.models.try_on import TryOnJob, TryOnRequest, TryOnStatus
from app.services.fashn_provider import FashnProviderError
from app.services.fashn_vton_provider import FashnVtonProviderError
from app.services.try_on_job_service import TryOnJobService
from app.services.try_on_service import TryOnService

router = APIRouter(prefix="/api/try-on", tags=["try-on"])
job_service = TryOnJobService()
provider_service = TryOnService()


@router.post("/jobs", response_model=TryOnJob, status_code=202)
def create_try_on_job(
    request: TryOnRequest,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> TryOnJob:
    """Create and persist a try-on job owned by the authenticated user."""

    user_id = str(user["id"])
    try:
        ai_rate_limiter.check(user_id, TRY_ON_REQUESTS, TRY_ON_WINDOW_SECONDS)
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many Try-On requests. Please wait before trying again.",
            headers={"Retry-After": str(TRY_ON_WINDOW_SECONDS)},
        ) from exc

    try:
        job, submission = provider_service.create_job(request)
        metadata = dict(request.metadata)
        if submission.prediction_id:
            metadata["provider_prediction_id"] = submission.prediction_id
        return job_service.create_job(
            request,
            user_id=user_id,
            provider=job.provider,
            job_id=job.id,
            status=job.status,
            error=job.error,
            metadata=metadata,
        )
    except (FashnProviderError, FashnVtonProviderError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.get("/jobs/{job_id}", response_model=TryOnJob)
def get_try_on_job(
    job_id: str,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> TryOnJob:
    """Return the latest provider-backed state of a user's try-on job."""

    user_id = str(user["id"])
    context = job_service.get_job_context(job_id, user_id=user_id)
    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on job not found",
        )

    job = context.job
    if job.status in {TryOnStatus.COMPLETED, TryOnStatus.FAILED}:
        return job

    prediction_id = context.metadata.get("provider_prediction_id")
    if not isinstance(prediction_id, str) or not prediction_id.strip():
        return job

    try:
        provider = provider_service.provider_for_name(job.provider)
        payload = provider.get_status(prediction_id)
    except ValueError as exc:
        return _fail_job(job_id, user_id, str(exc))
    except (FashnProviderError, FashnVtonProviderError) as exc:
        failed = job_service.update_status(
            job_id,
            user_id=user_id,
            status=TryOnStatus.FAILED,
            error=str(exc),
        )
        if failed is not None:
            return failed
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    provider_status = str(payload.get("status", "")).strip().lower()
    if not provider_status:
        return _fail_job(job_id, user_id, "Try-On provider returned an invalid status payload")

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

    result_url = None
    if mapped_status == TryOnStatus.COMPLETED:
        output = payload.get("output")
        if isinstance(output, list):
            candidate = output[0] if output else None
        else:
            candidate = output
        if isinstance(candidate, str) and candidate.strip():
            result_url = candidate.strip()
        else:
            return _fail_job(job_id, user_id, "Try-On provider completed without a valid output image")

    error = payload.get("error") if mapped_status == TryOnStatus.FAILED else None
    if mapped_status == TryOnStatus.FAILED and not error:
        error = "Try-On provider prediction failed"

    updated = job_service.update_status(
        job_id,
        user_id=user_id,
        status=mapped_status,
        result_image_path=result_url,
        error=str(error) if error else None,
    )
    return updated or job


def _fail_job(job_id: str, user_id: str, error: str) -> TryOnJob:
    """Persist a provider validation failure and return the latest job."""

    failed = job_service.update_status(
        job_id,
        user_id=user_id,
        status=TryOnStatus.FAILED,
        error=error,
    )
    if failed is not None:
        return failed
    raise HTTPException(status_code=502, detail=error)
