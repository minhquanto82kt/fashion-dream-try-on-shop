create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text null,
  body text not null check (char_length(trim(body)) between 3 and 2000),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

alter table public.product_reviews enable row level security;
create index if not exists product_reviews_product_idx on public.product_reviews(product_id, created_at desc);
create index if not exists product_reviews_user_idx on public.product_reviews(user_id, created_at desc);

create policy "product reviews select published or backoffice"
on public.product_reviews for select to anon, authenticated
using ((status = 'published') or (select has_backoffice_role('staff'::app_role)));

create policy "product reviews insert verified buyer or backoffice"
on public.product_reviews for insert to authenticated
with check (
  (select has_backoffice_role('staff'::app_role))
  or (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = product_reviews.product_id
        and o.user_id = (select auth.uid())
        and (o.payment_status = 'paid' or o.order_status = 'completed')
    )
  )
);

create policy "product reviews update own or backoffice"
on public.product_reviews for update to authenticated
using (((select auth.uid()) = user_id) or (select has_backoffice_role('staff'::app_role)))
with check (((select auth.uid()) = user_id) or (select has_backoffice_role('staff'::app_role)));

create policy "product reviews delete own or backoffice"
on public.product_reviews for delete to authenticated
using (((select auth.uid()) = user_id) or (select has_backoffice_role('staff'::app_role)));

create or replace function public.set_product_reviews_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists product_reviews_updated_at on public.product_reviews;
create trigger product_reviews_updated_at before update on public.product_reviews
for each row execute function public.set_product_reviews_updated_at();
