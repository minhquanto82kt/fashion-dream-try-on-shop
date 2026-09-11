create table if not exists public.try_on_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  provider text not null default 'stub',
  category text not null default 'top' check (category in ('top', 'bottom', 'dress', 'outerwear', 'full_body')),
  person_image_path text,
  garment_image_path text,
  result_image_path text,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists try_on_jobs_user_id_created_at_idx
  on public.try_on_jobs (user_id, created_at desc);

create index if not exists try_on_jobs_status_created_at_idx
  on public.try_on_jobs (status, created_at asc);

create or replace function public.set_try_on_jobs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists try_on_jobs_set_updated_at on public.try_on_jobs;
create trigger try_on_jobs_set_updated_at
before update on public.try_on_jobs
for each row execute function public.set_try_on_jobs_updated_at();

alter table public.try_on_jobs enable row level security;

create policy "Users can read their own try-on jobs"
on public.try_on_jobs for select to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own try-on jobs"
on public.try_on_jobs for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own try-on jobs"
on public.try_on_jobs for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
