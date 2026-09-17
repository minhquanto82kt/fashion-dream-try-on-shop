from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware.request_observability import RequestObservabilityMiddleware


def _client() -> TestClient:
    app = FastAPI()
    app.add_middleware(RequestObservabilityMiddleware)

    @app.get("/ping")
    def ping() -> dict[str, str]:
        return {"status": "ok"}

    return TestClient(app)


def test_request_id_is_generated_and_returned() -> None:
    response = _client().get("/ping")

    assert response.status_code == 200
    request_id = response.headers.get("x-request-id")
    assert request_id


def test_existing_request_id_is_preserved() -> None:
    request_id = "qa-request-123"
    response = _client().get("/ping", headers={"x-request-id": request_id})

    assert response.status_code == 200
    assert response.headers.get("x-request-id") == request_id
