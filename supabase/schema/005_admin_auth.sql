-- Fashion Dream Try-On Shop | admin authorization schema snapshot
-- Supabase project: oazipcrbutizdncctkcg | Branch: feature/product-admin
-- Reference only. auth.users is owned by Supabase Auth.

create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path to ''
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;

alter table public.admin_users enable row level security;
-- No direct client policies: membership is managed by privileged workflows.
-- SECURITY DEFINER surface must be hardened/restricted before broader RPC exposure.