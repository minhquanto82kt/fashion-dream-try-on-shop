# Cloud Operations

Cloud automation is intentionally verification-first.

## Scope

- Vercel deployment/status
- Supabase connectivity and configuration checks
- Production route verification
- AI provider health checks

## Safety boundary

Cloud scripts must not silently mutate production data, disable RLS, rotate secrets, delete deployments, or change payment/order state.

Deployment flow:

`check -> deploy -> verify`

Any future destructive cloud operation must require explicit operator intent and a separate reviewed command.
