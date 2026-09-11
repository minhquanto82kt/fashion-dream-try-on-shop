"""AI Try-On job endpoints."""

from fastapi import APIRouter

from app.models.try_on import TryOnJob, TryOnRequest
from app.services.try_on_service import TryOnService

router = APIRouter(prefix="/api/try-on", tags=["try-on"])
service = TryOnService()


@router.post("/jobs", response_model=TryOnJob, status_code=202)
def create_try_on_job(request: TryOnRequest) -> TryOnJob:
    """Create a provider-independent try-on job."""

    return service.create_job(request)
