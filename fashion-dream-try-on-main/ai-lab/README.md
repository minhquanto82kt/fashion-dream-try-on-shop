# WEARO AI Lab

AI research, benchmark and validation layer for WEARO.

```text
ai-lab/
├── notebooks/       Google Colab entry points
├── experiments/     reproducible experiment metadata/configs
├── evaluation/      output-quality and contract checks
├── benchmarks/      latency/provider/GPU benchmark scripts
└── README.md
```

## Production boundary

Colab and `ai-lab/` are **not** production inference. Production flow remains:

```text
WEARO Frontend
  -> FastAPI
  -> Supabase try_on_jobs
  -> provider router
  -> FASHN hosted OR GPU VTON
  -> Supabase Storage
  -> signed result URL
```

The database-backed queue is reconciled by a scheduled worker at `/api/try-on/internal/worker/reconcile`.

## Colab workflow

1. Clone the exact GitHub branch/revision being tested.
2. Run the notebook bootstrap cell.
3. Load credentials from Colab Secrets, never from committed cells.
4. Run a controlled experiment.
5. Export a JSON result matching `experiments/experiment.schema.json`.
6. Run benchmark/evaluation scripts.
7. Promote only validated provider/model/config changes to production code.

## Security

Never commit API keys, Supabase service-role keys, customer images, private URLs or model credentials.
