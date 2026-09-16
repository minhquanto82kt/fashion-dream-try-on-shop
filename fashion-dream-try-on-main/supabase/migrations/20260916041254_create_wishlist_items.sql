create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "Users can read own wishlist"
on public.wishlist_items for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add to own wishlist"
on public.wishlist_items for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove own wishlist"
on public.wishlist_items for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists wishlist_items_user_id_created_at_idx
  on public.wishlist_items(user_id, created_at desc);
