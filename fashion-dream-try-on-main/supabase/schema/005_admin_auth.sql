-- Fashion Dream Try-On Shop
-- Schema reference snapshot: admin authorization
-- Supabase project: oazipcrbutizdncctkcg
-- Branch: feature/product-admin
-- IMPORTANT: Reference only. auth.users is owned by Supabase Auth.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Current production helper. This function is SECURITY DEFINER and therefore
-- must be reviewed/hardened before being exposed as a public RPC surface.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.admin_users enable row level security;

-- admin_users intentionally has no direct client SELECT/INSERT/UPDATE/DELETE
-- policies. Membership is managed through privileged/admin workflows.
-- Do not expose service_role credentials to the browser.