drop policy if exists "admins can read orders" on public.orders;
drop policy if exists "customers can read own orders" on public.orders;
create policy "customers and admins can read orders"
on public.orders for select
to authenticated
using ((select public.is_admin()) or (select auth.uid()) = user_id);
