"""Image-engine foundation for safe image validation and normalization."""

from dataclasses import dataclass
from io import BytesIO

from PIL import Image, UnidentifiedImageError
from PIL.Image import DecompressionBombError, DecompressionBombWarning
from PIL.ImageOps import exif_transpose
import warnings


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": {"JPEG"},
    "image/png": {"PNG"},
    "image/webp": {"WEBP"},
}

MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_IMAGE_DIMENSION = 4096
MAX_IMAGE_PIXELS = MAX_IMAGE_DIMENSION * MAX_IMAGE_DIMENSION
NORMALIZED_FORMAT = "WEBP"
NORMALIZED_CONTENT_TYPE = "image/webp"


@dataclass(frozen=True)
class ImageMetadata:
    """Validated image metadata used by later AI processing stages."""

    content_type: str
    format: str
    width: int
    height: int
    size_bytes: int


def _open_validated_image(data: bytes, content_type: str) -> Image.Image:
    """Open an image only after checking its declared and actual formats."""

    if not data:
        raise ValueError("Image is empty")
    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Image exceeds the 10 MB limit")

    formats = ALLOWED_IMAGE_TYPES.get(content_type.lower())
    if formats is None:
        raise ValueError("Unsupported image type")

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", DecompressionBombWarning)
            image = Image.open(BytesIO(data))
            image.verify()

        with warnings.catch_warnings():
            warnings.simplefilter("error", DecompressionBombWarning)
            image = Image.open(BytesIO(data))
            image_format = image.format or ""
            if image_format not in formats:
                image.close()
                raise ValueError("Image content does not match its content type")
            width, height = image.size
            if width <= 0 or height <= 0:
                image.close()
                raise ValueError("Image has invalid dimensions")
            if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
                image.close()
                raise ValueError("Image dimensions exceed the 4096 px limit")
            if width * height > MAX_IMAGE_PIXELS:
                image.close()
                raise ValueError("Image pixel count is too large")
            return image.copy()
    except (DecompressionBombError, DecompressionBombWarning) as exc:
        raise ValueError("Image dimensions are unsafe") from exc
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("Invalid image file") from exc


def validate_image(data: bytes, content_type: str) -> ImageMetadata:
    """Validate an uploaded image without persisting or processing it."""

    image = _open_validated_image(data, content_type)
    try:
        return ImageMetadata(
            content_type=content_type.lower(),
            format=image.format or "",
            width=image.width,
            height=image.height,
            size_bytes=len(data),
        )
    finally:
        image.close()


def normalize_image(data: bytes, content_type: str) -> tuple[bytes, ImageMetadata]:
    """Normalize a valid image for consistent downstream AI processing.

    EXIF orientation is applied, transparency is preserved during conversion,
    and oversized images are resized so later model stages receive predictable
    dimensions. The normalized output is WebP.
    """

    image = _open_validated_image(data, content_type)
    try:
        image = exif_transpose(image)
        image.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)

        if image.mode not in ("RGB", "RGBA"):
            if "A" in image.getbands():
                image = image.convert("RGBA")
            else:
                image = image.convert("RGB")

        output = BytesIO()
        image.save(output, format=NORMALIZED_FORMAT, quality=90, method=6)
        normalized = output.getvalue()

        metadata = ImageMetadata(
            content_type=NORMALIZED_CONTENT_TYPE,
            format=NORMALIZED_FORMAT,
            width=image.width,
            height=image.height,
            size_bytes=len(normalized),
        )
        return normalized, metadata
    finally:
        image.close()
