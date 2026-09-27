# WEARO AI Lab

AI research and validation workspace for the WEARO project.

## Purpose

`ai-lab/` is the experimental layer between the GitHub source code and production AI services.

Use it for:

- Google Colab experiments
- FASHN VTON validation
- model/parameter experiments
- latency and output-quality benchmarks
- reproducible evaluation

Do **not** use Colab as the production API. Production inference remains separated in `gpu-tryon/`, while the main FastAPI application owns authentication, job ownership and durable lifecycle persistence.

## Current production boundary

```text
WEARO Frontend
      |
      v
Python FastAPI
      |
      +--> FASHN hosted provider
      |
      +--> FASHN VTON GPU service
                |
                v
          FASHN VTON 1.5
```

The GPU service currently downloads model weights from Hugging Face into its mounted model volume. See `../gpu-tryon/scripts/download_weights.py`.

## R&D boundary

```text
GitHub
  |
  v
Google Colab
  |
  +--> experiment
  +--> benchmark
  +--> evaluate
  +--> record result
  |
  v
GitHub
```

An experiment result must not be treated as production-ready until it has been validated against the production contract.

## Directory structure

```text
ai-lab/
├── notebooks/
├── experiments/
└── evaluation/
```

The first notebook is `notebooks/01_fashn_vton_colab.ipynb`.

## Security

Never commit:

- API keys
- Supabase service-role keys
- VTON API keys
- private image URLs
- customer images containing personal data
- model credentials

Use Colab Secrets or environment variables for credentials.

## MVP workflow

1. Clone this repository in Colab.
2. Run the bootstrap cells in the notebook.
3. Confirm the repository revision being tested.
4. Run controlled VTON experiments.
5. Record model/version, inputs, runtime and observed output quality.
6. Keep production credentials out of the notebook.
7. Only promote validated changes into `gpu-tryon/` or the Python backend through normal GitHub review.
