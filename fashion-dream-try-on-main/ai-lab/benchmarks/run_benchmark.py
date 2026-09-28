"""HTTP benchmark for a WEARO Try-On provider endpoint.

Designed for Google Colab or a local notebook. It measures API submission
latency only; provider inference latency is measured by polling the returned
job until completion.
"""

from __future__ import annotations

import json
import os
import statistics
import time
import urllib.request


API_URL = os.getenv("WEARO_TRYON_URL", "").rstrip("/")
API_TOKEN = os.getenv("WEARO_TRYON_TOKEN", "")
PERSON_IMAGE_URL = os.getenv("WEARO_PERSON_IMAGE_URL", "")
GARMENT_IMAGE_URL = os.getenv("WEARO_GARMENT_IMAGE_URL", "")
CATEGORY = os.getenv("WEARO_CATEGORY", "tops")
ROUNDS = int(os.getenv("WEARO_BENCHMARK_ROUNDS", "3"))


def post_job() -> tuple[str, float]:
    payload = json.dumps({
        "person_image_url": PERSON_IMAGE_URL,
        "garment_image_url": GARMENT_IMAGE_URL,
        "category": CATEGORY,
    }).encode("utf-8")
    request = urllib.request.Request(
        f"{API_URL}/v1/try-on",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_TOKEN}"},
        method="POST",
    )
    started = time.perf_counter()
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.load(response)
    submit_ms = (time.perf_counter() - started) * 1000
    return str(body["id"]), submit_ms


def poll(job_id: str) -> tuple[str, float]:
    started = time.perf_counter()
    deadline = started + 300
    while time.perf_counter() < deadline:
        request = urllib.request.Request(
            f"{API_URL}/v1/try-on/{job_id}",
            headers={"Authorization": f"Bearer {API_TOKEN}"},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.load(response)
        status = str(body.get("status", "unknown"))
        if status in {"completed", "failed"}:
            return status, (time.perf_counter() - started) * 1000
        time.sleep(2)
    return "timeout", (time.perf_counter() - started) * 1000


def main() -> None:
    if not API_URL or not API_TOKEN or not PERSON_IMAGE_URL or not GARMENT_IMAGE_URL:
        raise SystemExit("Set WEARO_TRYON_URL, WEARO_TRYON_TOKEN, WEARO_PERSON_IMAGE_URL and WEARO_GARMENT_IMAGE_URL")

    submit_times: list[float] = []
    total_times: list[float] = []
    statuses: list[str] = []
    for _ in range(ROUNDS):
        job_id, submit_ms = post_job()
        status, provider_ms = poll(job_id)
        submit_times.append(submit_ms)
        total_times.append(submit_ms + provider_ms)
        statuses.append(status)

    print(json.dumps({
        "rounds": ROUNDS,
        "submit_ms": {"median": statistics.median(submit_times), "samples": submit_times},
        "end_to_end_ms": {"median": statistics.median(total_times), "samples": total_times},
        "statuses": statuses,
    }, indent=2))


if __name__ == "__main__":
    main()
