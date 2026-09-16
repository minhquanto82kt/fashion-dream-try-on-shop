#!/usr/bin/env python3
"""Download FASHN VTON v1.5 and DWPose weights into the mounted model volume."""

import os
from pathlib import Path

from huggingface_hub import hf_hub_download


weights_dir = Path(os.getenv("VTON_WEIGHTS_DIR", "/models/fashn-vton"))
dwpose_dir = weights_dir / "dwpose"
weights_dir.mkdir(parents=True, exist_ok=True)
dwpose_dir.mkdir(parents=True, exist_ok=True)

hf_hub_download(
    repo_id="fashn-ai/fashn-vton-1.5",
    filename="model.safetensors",
    local_dir=str(weights_dir),
)

for filename in ("yolox_l.onnx", "dw-ll_ucoco_384.onnx"):
    hf_hub_download(
        repo_id="fashn-ai/DWPose",
        filename=filename,
        local_dir=str(dwpose_dir),
    )

print(f"FASHN VTON weights ready in {weights_dir}")
