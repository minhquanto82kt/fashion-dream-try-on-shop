"""AI Try-On job endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.models.try_on import TryOnJob, TryOnRequest, TryOnStatus
from app.services.fashn_provider import FashnProviderError
from app.services.try_on_job_service import TryOnJobService
from app.services.try_on_service import FashnProviderAdapter, TryOnService

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
        job, submission = provider_service.create_job(request)
        metadata = dict(request.metadata)
        if submission.prediction_id:
            metadata["provider_prediction_id"] = submission.prediction_id
        return job_service.create_job(
            request,
            user_id=user_id,
            provider=job.provider,
            job_id=job.id,
            metadata=metadata,
        )
    except FashnProviderError as exc:
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
    if job.provider != "fashn-v1.6":
        return job

    prediction_id = context.metadata.get("provider_prediction_id")
    if not isinstance(prediction_id, str) or not prediction_id:
        return job

    try:
        provider = FashnProviderAdapter()
        payload = provider.get_status(prediction_id)
    except FashnProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    provider_status = str(payload.get("status", "")).lower()
    mapped_status = {
        "starting": TryOnStatus.PROCESSING,
        "in_queue": TryOnStatus.PROCESSING,
        "processing": TryOnStatus.PROCESSING,
        "completed": TryOnStatus.COMPLETED,
        "failed": TryOnStatus.FAILED,
        "canceled": TryOnStatus.FAILED,
        "cancelled": TryOnStatus.FAILED,
    }.get(provider_status)

    if mapped_status is None:
        return job

    output = payload.get("output")
    result_url = output[0] if mapped_status == TryOnStatus.COMPLETED and isinstance(output, list) and output else None
    error = payload.get("error") if mapped_status == TryOnStatus.FAILED else None

    updated = job_service.update_status(
        job_id,
        user_id=user_id,
        status=mapped_status,
        result_image_path=str(result_url) if result_url else None,
        error=str(error) if error else None,
    )
    return updated or job
