# AI backend operations

## Lifecycle

```text
queued -> processing -> completed
                    \-> failed
```

Supabase `try_on_jobs` is the durable source of truth. The provider layer remains replaceable, while the scheduled worker reconciles pending jobs without requiring the browser to poll forever.

## Worker

`POST /api/try-on/internal/worker/reconcile` is protected by `CRON_SECRET` and processes a bounded batch. It is configured in `vercel.json` as a scheduled invocation.

## Metrics

`GET /api/try-on/internal/worker/metrics` reports a bounded recent sample by status/provider plus recent failures. It is operational telemetry, not a billing or financial report.

## Optimization loop

```text
Colab experiment
  -> benchmark
  -> evaluation
  -> production configuration
  -> durable jobs
  -> metrics
  -> next experiment
```
