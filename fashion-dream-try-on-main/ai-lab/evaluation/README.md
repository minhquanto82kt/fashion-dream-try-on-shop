# Evaluation

Evaluation is intentionally split into two layers:

1. **Contract/structural checks** — deterministic checks such as image format, dimensions and job lifecycle.
2. **Perceptual quality review** — human/model-assisted review performed in Colab and recorded in experiment JSON.

`evaluate_image.py` is a lightweight deterministic baseline. It does not claim to measure garment realism, identity preservation or fit quality.
