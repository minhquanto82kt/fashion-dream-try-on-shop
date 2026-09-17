"""Internal Try-On bridge for the same-origin TanStack server functions."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.config import get_settings
from app.models.try_on import TryOnJob
from app.services.try_on_job_service import TryOnJobService

router = APIRouter(prefix="/api/try-on/internal", tags=["try-on-internal"])
job_service = TryOnJobService()


def _require_internal_secret(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    """Allow only the server-side application bridge to call this API."""

    expected = get_settings().supabase_service_role_key.strip()
    supplied = authorization[7:].strip() if authorization and authorization.lower().startswith("bearer ") else ""
    if not expected or not supplied or supplied != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Internal authentication required")


@router.get("/jobs/{job_id}", response_model=TryOnJob, dependencies=[Depends(_require_internal_secret)])
def get_internal_try_on_job(job_id: str) -> TryOnJob:
    """Return a job for the trusted same-origin server bridge."""

    context = job_service.get_job_context_internal(job_id)
    if context is None:
        raise HTTPException(status_code=404, detail="Try-on job not found")
    return context.job
