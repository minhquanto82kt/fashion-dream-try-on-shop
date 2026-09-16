# FASHN VTON GPU Service

Standalone GPU inference service for FASHN VTON v1.5.

## Why this is separate

The main Fashion Dream FastAPI application remains lightweight and continues to own authentication, job ownership and lifecycle persistence. Heavy PyTorch/VTON inference runs here.

FASHN VTON v1.5 provides a `TryOnPipeline` and requires PyTorch, torchvision, ONNX Runtime GPU and the FASHN human parser. The upstream project documents roughly 2 GB of model weights, with human-parser weights downloaded to the Hugging Face cache on first use.

## Current service contract

```text
POST /v1/try-on
GET  /v1/try-on/{job_id}
GET  /v1/try-on/{job_id}/result
GET  /health
GET  /ready
```

Submission payload:

```json
{
  "person_image_url": "https://...",
  "garment_image_url": "https://...",
  "category": "tops"
}
```

## Model bootstrap

Do not commit model weights to Git. Mount a persistent volume at `/models` and run:

```text
python3 scripts/download_weights.py
```

The upstream project downloads `model.safetensors` and the two DWPose ONNX models from Hugging Face; the human parser is cached separately.

Use `/health` for process-level health and `/ready` to verify that the primary VTON model weight exists before sending inference traffic.

## Required environment

```text
VTON_API_KEY=<server-to-server secret>
VTON_PUBLIC_BASE_URL=https://<gpu-service-host>
VTON_WEIGHTS_DIR=/models/fashn-vton
VTON_OUTPUT_DIR=/outputs
HF_HOME=/models/huggingface
ALLOWED_IMAGE_HOSTS=<trusted image hosts, comma-separated>
MAX_IMAGE_BYTES=12582912
```

The main FastAPI service should call this service server-to-server and use the same `VTON_API_KEY` as `LOCAL_TRYON_API_KEY`.

## Result lifecycle

The GPU service intentionally keeps inference output local only long enough for the main FastAPI service to retrieve it. The main service then persists the completed image to the existing private Supabase Storage bucket `try-on-assets` and stores the resulting `results/{job_id}.png` path in `try_on_jobs.result_image_path`.

The client receives a short-lived signed Supabase URL from the main FastAPI API. The GPU service must therefore never receive the Supabase service-role key.

## Integration-test sequence

1. Deploy this service on a GPU host with persistent `/models` and `/outputs` volumes.
2. Run `scripts/download_weights.py` and wait until `/ready` returns HTTP 200.
3. Set `LOCAL_TRYON_API_URL` to the GPU service URL in the main FastAPI environment.
4. Set the same secret in `LOCAL_TRYON_API_KEY` and GPU `VTON_API_KEY`.
5. Set `TRY_ON_PROVIDER=fashn-local` in the main FastAPI environment.
6. Submit one authenticated request to the main `POST /api/try-on/jobs` endpoint using HTTPS image URLs that are allowed by the GPU `ALLOWED_IMAGE_HOSTS` list.
7. Poll `GET /api/try-on/jobs/{job_id}` until `completed` or `failed`.
8. On `completed`, verify `result_image_url` is a signed Supabase Storage URL and verify the corresponding `try_on_jobs.result_image_path` record exists.
9. Open the returned image in `/ai` after the frontend is wired to this job API.

## Important MVP limitation

The GPU service still uses an in-memory job registry and local result files. Restarting the GPU container loses queued jobs and local outputs. This is acceptable for the isolated integration test, because the main FastAPI/Supabase layer is the durable application boundary. Before high-volume production use, the GPU queue/output lifecycle should be made durable as well.

## Model/license note

The FASHN VTON v1.5 repository is Apache-2.0, but it explicitly lists third-party components, including `fashn-human-parser`, with their own licensing. Review all component licenses before commercial distribution.
