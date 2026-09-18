-- WEARO Phase B security hardening
-- This file is a migration proposal for the Supabase project.
-- Review against the live migration history before execution.

-- 1) Harden the admin membership RPC boundary.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2) Bind orders to the authenticated customer.
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_user_id_created_at_idx
  on public.orders(user_id, created_at desc);

-- Existing admin policies remain. Add a customer read policy without exposing
-- other customers' orders.
drop policy if exists "customers can read own orders" on public.orders;
create policy "customers can read own orders"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "customers can read own order items" on public.order_items;
create policy "customers can read own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

-- Customers must not mutate orders directly. Order creation remains behind
-- the atomic create_order_atomic RPC.

-- 3) AI jobs are user-readable but provider-owned after creation.
-- The application backend should update status/result using its privileged
-- server boundary, not a browser access token.
drop policy if exists "Users can update their own try-on jobs" on public.try_on_jobs;

-- Keep client insert only if the live application intentionally creates jobs
-- directly from an authenticated browser. Otherwise remove this policy too
-- and create jobs exclusively through the server-side AI job endpoint.
