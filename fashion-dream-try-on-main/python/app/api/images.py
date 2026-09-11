"""Image-engine API endpoints."""

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.services.image_service import normalize_image, validate_image

router = APIRouter(prefix="/api/images", tags=["images"])


@router.post("/validate")
async def validate_uploaded_image(file: UploadFile = File(...)) -> dict:
    """Validate an image upload and return metadata for later AI processing."""

    content_type = file.content_type or ""
    data = await file.read()
    try:
        metadata = validate_image(data, content_type)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return {
        "valid": True,
        "content_type": metadata.content_type,
        "format": metadata.format,
        "width": metadata.width,
        "height": metadata.height,
        "size_bytes": metadata.size_bytes,
    }


@router.post("/normalize")
async def normalize_uploaded_image(file: UploadFile = File(...)) -> Response:
    """Validate and normalize an image for downstream AI processing."""

    content_type = file.content_type or ""
    data = await file.read()
    try:
        normalized, _metadata = normalize_image(data, content_type)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return Response(
        content=normalized,
        media_type="image/webp",
        headers={"Content-Disposition": 'inline; filename="normalized.webp"'},
    )
