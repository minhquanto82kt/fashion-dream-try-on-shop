"""Standalone GPU inference service for FASHN VTON v1.5.

This service is intentionally independent from the main FastAPI application.
It owns model loading and GPU inference only. Persistent result storage is a
separate integration step and is not faked here.
"""

from __future__ import annotations

import asyncio
import ipaddress
import os
import socket
from dataclasses import dataclass
from pathlib import Path
from typing import Literal
from urllib.parse import urlparse
from uuid import uuid4

import httpx
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from PIL import Image

from fashn_vton import TryOnPipeline


app = FastAPI(title="Fashion Dream VTON GPU Service", version="0.1.0")

WEIGHTS_DIR = Path(os.getenv("VTON_WEIGHTS_DIR", "/models/fashn-vton"))
OUTPUT_DIR = Path(os.getenv("VTON_OUTPUT_DIR", "/outputs"))
PUBLIC_BASE_URL = os.getenv("VTON_PUBLIC_BASE_URL", "").rstrip("/")
API_KEY = os.getenv("VTON_API_KEY", "")
ALLOWED_IMAGE_HOSTS = {
    host.strip().lower()
    for host in os.getenv("ALLOWED_IMAGE_HOSTS", "").split(",")
    if host.strip()
}
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(12 * 1024 * 1024)))

pipeline: TryOnPipeline | None = None
pipeline_lock = asyncio.Lock()


@dataclass
class Job:
    status: Literal["queued", "processing", "completed", "failed"]
    output_path: Path | None = None
    error: str | None = None


jobs: dict[str, Job] = {}


class TryOnRequest(BaseModel):
    person_image_url: str = Field(min_length=1)
    garment_image_url: str = Field(min_length=1)
    category: Literal["tops", "bottoms", "one-pieces"]
    garment_photo_type: Literal["model", "flat-lay"] = "model"
    num_timesteps: int = Field(default=30, ge=20, le=50)
    guidance_scale: float = Field(default=1.5, ge=1.0, le=5.0)
    seed: int = Field(default=42, ge=0)


class JobResponse(BaseModel):
    id: str
    status: str
    output: list[str] | None = None
    error: str | None = None


def _authorize(authorization: str | None) -> None:
    if not API_KEY:
        return
    if authorization != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="Invalid GPU service credentials")


def _validate_remote_url(value: str) -> None:
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.hostname:
        raise HTTPException(status_code=400, detail="Image URLs must use HTTPS")

    hostname = parsed.hostname.lower()
    if ALLOWED_IMAGE_HOSTS and hostname not in ALLOWED_IMAGE_HOSTS:
        raise HTTPException(status_code=400, detail="Image host is not allowlisted")

    try:
        addresses = socket.getaddrinfo(hostname, 443, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail="Image host could not be resolved") from exc

    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            raise HTTPException(status_code=400, detail="Private image hosts are not allowed")


async def _download_image(url: str, destination: Path) -> None:
    _validate_remote_url(url)
    total = 0
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        async with client.stream("GET", url) as response:
            response.raise_for_status()
            content_type = response.headers.get("content-type", "").lower()
            if not content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="Remote resource is not an image")
            with destination.open("wb") as handle:
                async for chunk in response.aiter_bytes(64 * 1024):
                    total += len(chunk)
                    if total > MAX_IMAGE_BYTES:
                        raise HTTPException(status_code=413, detail="Image exceeds the configured size limit")
                    handle.write(chunk)


def _get_pipeline() -> TryOnPipeline:
    global pipeline
    if pipeline is None:
        pipeline = TryOnPipeline(weights_dir=str(WEIGHTS_DIR))
    return pipeline


async def _run_job(job_id: str, request: TryOnRequest) -> None:
    job = jobs[job_id]
    job.status = "processing"
    work_dir = OUTPUT_DIR / job_id
    work_dir.mkdir(parents=True, exist_ok=True)
    person_path = work_dir / "person-input"
    garment_path = work_dir / "garment-input"
    output_path = work_dir / "result.png"

    try:
        await _download_image(request.person_image_url, person_path)
        await _download_image(request.garment_image_url, garment_path)
        person = Image.open(person_path).convert("RGB")
        garment = Image.open(garment_path).convert("RGB")

        def infer() -> None:
            result = _get_pipeline()(
                person_image=person,
                garment_image=garment,
                category=request.category,
                garment_photo_type=request.garment_photo_type,
                num_samples=1,
                num_timesteps=request.num_timesteps,
                guidance_scale=request.guidance_scale,
                seed=request.seed,
                segmentation_free=True,
            )
            if not result.images:
                raise RuntimeError("VTON pipeline returned no images")
            result.images[0].save(output_path, format="PNG")

        await asyncio.to_thread(infer)
        job.output_path = output_path
        job.status = "completed"
    except Exception as exc:  # noqa: BLE001 - job errors must be persisted as failed state
        job.status = "failed"
        job.error = str(exc)
    finally:
        for path in (person_path, garment_path):
            path.unlink(missing_ok=True)


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "model_loaded": pipeline is not None,
        "weights_dir": str(WEIGHTS_DIR),
    }


@app.post("/v1/try-on", response_model=JobResponse, status_code=202)
async def create_job(
    request: TryOnRequest,
    background_tasks: BackgroundTasks,
    authorization: str | None = Header(default=None),
) -> JobResponse:
    _authorize(authorization)
    job_id = str(uuid4())
    jobs[job_id] = Job(status="queued")
    background_tasks.add_task(_run_job, job_id, request)
    return JobResponse(id=job_id, status="queued")


@app.get("/v1/try-on/{job_id}", response_model=JobResponse)
def get_job(job_id: str, authorization: str | None = Header(default=None)) -> JobResponse:
    _authorize(authorization)
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="GPU Try-On job not found")

    output = None
    if job.status == "completed" and job.output_path is not None:
        if not PUBLIC_BASE_URL:
            raise HTTPException(status_code=503, detail="VTON_PUBLIC_BASE_URL is not configured")
        output = [f"{PUBLIC_BASE_URL}/v1/try-on/{job_id}/result"]

    return JobResponse(id=job_id, status=job.status, output=output, error=job.error)


@app.get("/v1/try-on/{job_id}/result")
def get_result(job_id: str, authorization: str | None = Header(default=None)) -> FileResponse:
    _authorize(authorization)
    job = jobs.get(job_id)
    if job is None or job.output_path is None or job.status != "completed":
        raise HTTPException(status_code=404, detail="Try-On result not available")
    return FileResponse(job.output_path, media_type="image/png", filename="try-on-result.png")
