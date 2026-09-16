#!/usr/bin/env bash
set -euo pipefail

MODEL_FILE="${VTON_WEIGHTS_DIR}/model.safetensors"
DWPOSE_DIR="${VTON_WEIGHTS_DIR}/dwpose"

if [[ ! -f "${MODEL_FILE}" || ! -f "${DWPOSE_DIR}/yolox_l.onnx" || ! -f "${DWPOSE_DIR}/dw-ll_ucoco_384.onnx" ]]; then
  echo "[gpu-tryon] Model weights missing; downloading to ${VTON_WEIGHTS_DIR}..."
  python3 scripts/download_weights.py
else
  echo "[gpu-tryon] Model weights already present."
fi

exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
