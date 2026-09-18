drop policy if exists "admins can read order items" on public.order_items;
drop policy if exists "customers can read own order items" on public.order_items;
create policy "customers and admins can read order items"
on public.order_items for select
to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
  )
);
