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

## Important MVP limitation

This first GPU service uses an in-memory job registry and local result files. That is suitable for an isolated GPU integration test, but **not yet production-grade**: restarting the container loses queued jobs and results. The next integration step must move completed results into Supabase Storage and move job durability to the existing `try_on_jobs` lifecycle before enabling `TRY_ON_PROVIDER=fashn-local` in production.

## Model/license note

The FASHN VTON v1.5 repository is Apache-2.0, but it explicitly lists third-party components, including `fashn-human-parser`, with their own licensing. Review all component licenses before commercial distribution.
