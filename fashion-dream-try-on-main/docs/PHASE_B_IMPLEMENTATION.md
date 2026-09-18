# WEARO Phase B — Infrastructure

This branch applies the infrastructure portion of the WEARO roadmap without changing the visual system, palette, or typography.

## Implemented

### Production reliability

- Server-side upstream requests now use a 12-second timeout.
- Safe idempotent upstream requests (`GET`, `HEAD`, `OPTIONS`) retry up to two times with bounded exponential backoff.
- Supabase failures are normalized into safer application-level messages instead of returning raw database/server details to users.
- `src/server.ts` now assigns or propagates `x-request-id` and returns it on the response.
- Server requests and failures are emitted as structured JSON logs.
- Existing TanStack root error boundary and SSR fallback remain intact.

### Operational health

- Added `GET /api/health`.
- The endpoint checks application-to-Supabase connectivity and returns `200` when the database is reachable or `503` when the service is degraded.

### Security gate

- Added a CI static security test to ensure the server-only Supabase secret is not referenced by the browser Supabase helper.
- CI now runs the Phase B security gate after the existing customer-experience smoke test.

### Database security proposal

- Added `supabase/schema/010_phase_b_security_hardening.sql`.
- It hardens `is_admin()`, restricts execution to authenticated users, binds orders to `auth.users`, adds customer-owned order read policies, and removes direct client updates to AI job state.
- The SQL file is intentionally a migration proposal: the live Supabase migration history must be reviewed before executing it.

## Current architecture observations

The repository already contains substantial pieces of the roadmap: product/variant/image schema, orders and payments, admin authorization, AI try-on jobs, server-side AI calls, CI smoke tests, and a dedicated SSR server entry.

The remaining work should therefore be incremental rather than a rewrite.

## Next phases

1. **Phase B completion:** reconcile the SQL proposal with the live Supabase migration history and verify RLS against real customer/staff/admin sessions.
2. **Phase C:** make checkout invariants explicit: stock validation, price snapshotting, idempotency, duplicate-order protection, and failure recovery.
3. **Phase D:** formalize AI job ownership, provider abstraction, quotas, retry policy, and persistent result storage.
4. **Phase E:** image optimization, caching, lazy loading, server-side search/filter/pagination.
5. **Phase F:** E2E critical paths, upload abuse protection, rate limiting, and deeper security verification.
6. **Phase G:** SEO/search/analytics/growth work.
7. **Phase H:** WEARO brand governance and optional UpThink Easter eggs.

## Visual lock

Do not redesign the existing palette or typography as part of this roadmap. Infrastructure work should remain behaviorally and operationally focused.
