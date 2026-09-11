"""Image-engine foundation for safe image validation and metadata extraction."""

from dataclasses import dataclass
from io import BytesIO

from PIL import Image, UnidentifiedImageError


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": {"JPEG"},
    "image/png": {"PNG"},
    "image/webp": {"WEBP"},
}

MAX_IMAGE_BYTES = 10 * 1024 * 1024


@dataclass(frozen=True)
class ImageMetadata:
    """Validated image metadata used by later AI processing stages."""

    content_type: str
    format: str
    width: int
    height: int
    size_bytes: int


def validate_image(data: bytes, content_type: str) -> ImageMetadata:
    """Validate an uploaded image without persisting or processing it."""

    if not data:
        raise ValueError("Image is empty")
    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Image exceeds the 10 MB limit")

    formats = ALLOWED_IMAGE_TYPES.get(content_type.lower())
    if formats is None:
        raise ValueError("Unsupported image type")

    try:
        with Image.open(BytesIO(data)) as image:
            image.verify()
        with Image.open(BytesIO(data)) as image:
            image_format = image.format or ""
            if image_format not in formats:
                raise ValueError("Image content does not match its content type")
            width, height = image.size
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("Invalid image file") from exc

    return ImageMetadata(
        content_type=content_type.lower(),
        format=image_format,
        width=width,
        height=height,
        size_bytes=len(data),
    )
