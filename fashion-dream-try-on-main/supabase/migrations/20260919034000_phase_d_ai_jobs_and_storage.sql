create extension if not exists pgcrypto;

alter table public.try_on_jobs
  add column if not exists attempts integer not null default 0,
  add column if not exists max_attempts integer not null default 2,
  add column if not exists next_attempt_at timestamptz,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists idempotency_key text,
  add column if not exists client_key text,
  add column if not exists provider_error text,
  add column if not exists expires_at timestamptz;

create unique index if not exists try_on_jobs_idempotency_key_uidx
  on public.try_on_jobs (idempotency_key)
  where idempotency_key is not null;

create index if not exists try_on_jobs_queue_idx
  on public.try_on_jobs (status, next_attempt_at, created_at)
  where status in ('queued', 'processing');

create index if not exists try_on_jobs_client_created_idx
  on public.try_on_jobs (client_key, created_at desc);

create table if not exists public.ai_usage_daily (
  usage_date date not null default current_date,
  client_key text not null,
  job_count integer not null default 0 check (job_count >= 0),
  success_count integer not null default 0 check (success_count >= 0),
  failure_count integer not null default 0 check (failure_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (usage_date, client_key)
);

alter table public.ai_usage_daily enable row level security;
create index if not exists ai_usage_daily_client_date_idx on public.ai_usage_daily (client_key, usage_date desc);

create or replace function public.consume_ai_quota(p_client_key text, p_limit integer default 10)
returns jsonb language plpgsql security definer set search_path = public as $$
declare current_count integer;
begin
  if coalesce(trim(p_client_key), '') = '' then raise exception 'AI client key is required'; end if;
  if p_limit < 1 or p_limit > 100 then raise exception 'Invalid AI quota limit'; end if;
  insert into public.ai_usage_daily (usage_date, client_key, job_count)
  values (current_date, left(trim(p_client_key), 200), 1)
  on conflict (usage_date, client_key)
  do update set job_count = ai_usage_daily.job_count + 1, updated_at = now()
  returning job_count into current_count;
  if current_count > p_limit then
    update public.ai_usage_daily set job_count = job_count - 1, updated_at = now()
    where usage_date = current_date and client_key = left(trim(p_client_key), 200);
    return jsonb_build_object('allowed', false, 'remaining', 0, 'limit', p_limit);
  end if;
  return jsonb_build_object('allowed', true, 'remaining', greatest(p_limit - current_count, 0), 'limit', p_limit);
end;
$$;

create or replace function public.record_ai_usage_result(p_client_key text, p_success boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.ai_usage_daily
  set success_count = success_count + case when p_success then 1 else 0 end,
      failure_count = failure_count + case when p_success then 0 else 1 end,
      updated_at = now()
  where usage_date = current_date and client_key = left(trim(p_client_key), 200);
end;
$$;

revoke all on function public.consume_ai_quota(text, integer) from public, anon, authenticated;
revoke all on function public.record_ai_usage_result(text, boolean) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(text, integer) to service_role;
grant execute on function public.record_ai_usage_result(text, boolean) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ai-results', 'ai-results', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

revoke all on table public.ai_usage_daily from anon, authenticated;
