"""Tests for the image-engine foundation."""

from io import BytesIO

from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.services.image_service import normalize_image


client = TestClient(app)


def make_png(size: tuple[int, int] = (64, 64)) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", size, "white").save(buffer, format="PNG")
    return buffer.getvalue()


def test_validate_png() -> None:
    response = client.post(
        "/api/images/validate",
        files={"file": ("test.png", make_png(), "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["valid"] is True
    assert response.json()["format"] == "PNG"
    assert response.json()["width"] == 64
    assert response.json()["height"] == 64


def test_normalize_png_to_webp() -> None:
    normalized, metadata = normalize_image(make_png(), "image/png")

    assert metadata.content_type == "image/webp"
    assert metadata.format == "WEBP"
    assert metadata.width == 64
    assert metadata.height == 64

    with Image.open(BytesIO(normalized)) as image:
        assert image.format == "WEBP"
        assert image.size == (64, 64)


def test_normalize_large_dimension() -> None:
    normalized, metadata = normalize_image(make_png((4096, 2048)), "image/png")

    assert metadata.width == 4096
    assert metadata.height == 2048

    with Image.open(BytesIO(normalized)) as image:
        assert image.size == (4096, 2048)


def test_normalize_endpoint() -> None:
    response = client.post(
        "/api/images/normalize",
        files={"file": ("test.png", make_png(), "image/png")},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/webp"

    with Image.open(BytesIO(response.content)) as image:
        assert image.format == "WEBP"
        assert image.size == (64, 64)


def test_reject_unsupported_type() -> None:
    response = client.post(
        "/api/images/validate",
        files={"file": ("test.gif", b"not-an-image", "image/gif")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Unsupported image type"}


def test_reject_invalid_image_content() -> None:
    response = client.post(
        "/api/images/validate",
        files={"file": ("test.png", b"not-an-image", "image/png")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid image file"}
