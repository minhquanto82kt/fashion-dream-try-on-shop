"""Tests for the image-engine foundation."""

from io import BytesIO

from PIL import Image
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def make_png() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (64, 64), "white").save(buffer, format="PNG")
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
