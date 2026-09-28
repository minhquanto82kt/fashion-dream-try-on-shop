-- AI Try-On queue/monitoring indexes.
-- Keeps provider and lifecycle queries cheap as the job table grows.

create index if not exists try_on_jobs_provider_status_created_at_idx
  on public.try_on_jobs (provider, status, created_at asc);

create index if not exists try_on_jobs_updated_at_idx
  on public.try_on_jobs (updated_at desc);
