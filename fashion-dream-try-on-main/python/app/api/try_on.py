"""AI Try-On job endpoints."""

from typing import Annotated, Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.models.try_on import TryOnJob, TryOnRequest
from app.services.try_on_job_service import TryOnJobService
from app.services.try_on_service import StubTryOnProvider, TryOnService

router = APIRouter(prefix="/api/try-on", tags=["try-on"])
job_service = TryOnJobService()
provider_service = TryOnService(StubTryOnProvider())


@router.post("/jobs", response_model=TryOnJob, status_code=202)
def create_try_on_job(
    request: TryOnRequest,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> TryOnJob:
    """Create and persist a try-on job owned by the authenticated user."""

    user_id = str(user["id"])
    job = provider_service.create_job(request)
    return job_service.create_job(
        request,
        user_id=user_id,
        provider=job.provider,
        job_id=job.id,
    )


@router.get("/jobs/{job_id}", response_model=TryOnJob)
def get_try_on_job(
    job_id: str,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> TryOnJob:
    """Return a try-on job only when it belongs to the authenticated user."""

    job = job_service.get_job(job_id, user_id=str(user["id"]))
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on job not found",
        )
    return job
