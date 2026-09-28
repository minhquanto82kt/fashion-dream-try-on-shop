# Production migrations

This directory is intentionally a placeholder for the future replayable production migration history.

## Current state

The live Supabase project already has an existing production migration history. The repository's `supabase/schema/` files are reconstructed snapshots and must **not** be renamed or copied here as a fake baseline.

## Before adding migrations

1. Export/retrieve the authoritative production migration history.
2. Reconcile all existing tables, constraints, indexes, RLS policies, grants, functions, triggers, storage buckets, and storage policies.
3. Verify the result against `supabase/contracts/data-model.md`.
4. Test the resulting baseline on a non-production Supabase project.
5. Only then commit the ordered migration history here.

## Rules

- Never rewrite already-applied production migration IDs.
- Never silently convert a schema snapshot into a migration.
- Prefer small, ordered, reversible or safely additive changes.
- Every migration that changes authorization must include an RLS/grant review.
- Every migration that changes an entity must include a dependent application/API review.
- Production deployment must be verified after migration, not inferred from GitHub commit success.
