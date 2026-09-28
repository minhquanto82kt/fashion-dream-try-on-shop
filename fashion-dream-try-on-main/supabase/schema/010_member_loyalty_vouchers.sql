-- WEARO member loyalty / voucher schema
-- Applied to Supabase project oazipcrbutizdncctkcg as migration member_loyalty_vouchers.

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value > 0),
  min_order_value integer not null default 0 check (min_order_value >= 0),
  max_discount integer,
  usage_limit integer,
  used_count integer not null default 0 check (used_count >= 0),
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_vouchers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  voucher_id uuid not null references public.vouchers(id) on delete cascade,
  status text not null default 'available' check (status in ('available','used','expired')),
  claimed_at timestamptz not null default now(),
  used_at timestamptz,
  unique (user_id, voucher_id)
);

create index if not exists vouchers_active_dates_idx on public.vouchers(active, starts_at, ends_at);
create index if not exists user_vouchers_user_idx on public.user_vouchers(user_id, status);

alter table public.vouchers enable row level security;
alter table public.user_vouchers enable row level security;

revoke all on public.vouchers from anon, authenticated;
revoke all on public.user_vouchers from anon, authenticated;
grant select on public.vouchers to authenticated;
grant select, insert, update on public.user_vouchers to authenticated;

create policy "members can read active vouchers"
  on public.vouchers for select to authenticated
  using (active = true and starts_at <= now() and (ends_at is null or ends_at >= now()));

create policy "members can read their vouchers"
  on public.user_vouchers for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "members can claim their vouchers"
  on public.user_vouchers for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "members can update their vouchers"
  on public.user_vouchers for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into public.vouchers (code, title, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, active)
values
  ('WEARO10', 'Ưu đãi thành viên 10%', 'Giảm 10% cho đơn hàng từ 500.000đ.', 'percent', 10, 500000, 100000, 1000, true),
  ('WEARO50K', 'Voucher thành viên 50K', 'Giảm trực tiếp 50.000đ cho đơn hàng từ 800.000đ.', 'fixed', 50000, 800000, null, 1000, true),
  ('WEARO15', 'Ưu đãi thành viên 15%', 'Giảm 15% cho đơn hàng từ 1.200.000đ.', 'percent', 15, 1200000, 180000, 500, true)
on conflict (code) do update set
  title = excluded.title,
  description = excluded.description,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_order_value = excluded.min_order_value,
  max_discount = excluded.max_discount,
  usage_limit = excluded.usage_limit,
  active = excluded.active;
