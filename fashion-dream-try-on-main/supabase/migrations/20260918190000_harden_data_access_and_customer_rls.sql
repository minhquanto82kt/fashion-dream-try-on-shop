-- Mặt trận B: harden authorization, customer ownership, and RLS performance.

-- Customer order ownership. Guest orders remain service-role accessible and keep nullable user_id.
drop policy if exists "customers can read own orders" on public.orders;
create policy "customers can read own orders"
on public.orders for select
to authenticated
using ((select auth.uid()) = user_id);

-- Order items inherit customer ownership through their parent order.
drop policy if exists "customers can read own order items" on public.order_items;
create policy "customers can read own order items"
on public.order_items for select
to authenticated
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id
    and o.user_id = (select auth.uid())
));

-- Public catalogue exposes only active + published products.
drop policy if exists "public can read active products" on public.products;
create policy "public can read active products"
on public.products for select
to anon, authenticated
using (active = true and status = 'published');

drop policy if exists "public can read product variants" on public.product_variants;
create policy "public can read product variants"
on public.product_variants for select
to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_variants.product_id
    and p.active = true
    and p.status = 'published'
));

drop policy if exists "public can read active product images" on public.product_images;
create policy "public can read active product images"
on public.product_images for select
to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_images.product_id
    and p.active = true
    and p.status = 'published'
));

-- Optimize auth calls in existing RLS policies.
drop policy if exists "Users can read their own try-on jobs" on public.try_on_jobs;
create policy "Users can read their own try-on jobs"
on public.try_on_jobs for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own try-on jobs" on public.try_on_jobs;
create policy "Users can create their own try-on jobs"
on public.try_on_jobs for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own try-on jobs" on public.try_on_jobs;
create policy "Users can update their own try-on jobs"
on public.try_on_jobs for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own wishlist" on public.wishlist_items;
create policy "Users can read own wishlist"
on public.wishlist_items for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can add to own wishlist" on public.wishlist_items;
create policy "Users can add to own wishlist"
on public.wishlist_items for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove own wishlist" on public.wishlist_items;
create policy "Users can remove own wishlist"
on public.wishlist_items for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

-- Admin-only catalog/content policies should never be granted to PUBLIC.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='tags'
      AND policyname IN ('Admins can create tags','Admins can read tags','Admins can update tags','Admins can delete tags')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.tags', r.policyname);
  END LOOP;
END $$;
create policy "Admins can create tags" on public.tags for insert to authenticated with check ((select public.is_admin()) and (select auth.uid()) = created_by);
create policy "Admins can read tags" on public.tags for select to authenticated using ((select public.is_admin()));
create policy "Admins can update tags" on public.tags for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete tags" on public.tags for delete to authenticated using ((select public.is_admin()));

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='appearance_themes'
      AND policyname IN ('Admins can create appearance themes','Admins can update appearance themes','Admins can delete appearance themes')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.appearance_themes', r.policyname);
  END LOOP;
END $$;
create policy "Admins can create appearance themes" on public.appearance_themes for insert to authenticated with check ((select public.is_admin()) and ((created_by is null) or ((select auth.uid()) = created_by)));
create policy "Admins can update appearance themes" on public.appearance_themes for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete appearance themes" on public.appearance_themes for delete to authenticated using ((select public.is_admin()));

-- Remove the deprecated auth.role()-based service-role policy. service_role bypasses RLS by design.
drop policy if exists "service role manages product vision attributes" on public.product_vision_attributes;

-- Optimize existing admin policies that use is_admin().
drop policy if exists "Admins can create appearance palettes" on public.appearance_palettes;
create policy "Admins can create appearance palettes" on public.appearance_palettes for insert to authenticated with check ((select public.is_admin()) and (select auth.uid()) = created_by);
drop policy if exists "Admins can read appearance palettes" on public.appearance_palettes;
create policy "Admins can read appearance palettes" on public.appearance_palettes for select to authenticated using ((select public.is_admin()));
drop policy if exists "Admins can update appearance palettes" on public.appearance_palettes;
create policy "Admins can update appearance palettes" on public.appearance_palettes for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Admins can delete appearance palettes" on public.appearance_palettes;
create policy "Admins can delete appearance palettes" on public.appearance_palettes for delete to authenticated using ((select public.is_admin()));

drop policy if exists site_content_settings_admin_insert on public.site_content_settings;
create policy site_content_settings_admin_insert on public.site_content_settings for insert to authenticated with check ((select public.is_admin()) and (select auth.uid()) = updated_by);
drop policy if exists site_content_settings_admin_update on public.site_content_settings;
create policy site_content_settings_admin_update on public.site_content_settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Cover common foreign-key access paths.
create index if not exists appearance_palettes_created_by_idx on public.appearance_palettes(created_by);
create index if not exists appearance_themes_created_by_idx on public.appearance_themes(created_by);
create index if not exists site_theme_settings_updated_by_idx on public.site_theme_settings(updated_by);
create index if not exists tags_created_by_idx on public.tags(created_by);
create index if not exists product_tags_tag_id_idx on public.product_tags(tag_id);
create index if not exists wishlist_items_product_id_idx on public.wishlist_items(product_id);

-- SECURITY DEFINER admin publishing helpers are callable by service_role only.
revoke execute on function public.discard_site_content_draft() from authenticated;
revoke execute on function public.publish_appearance_theme(uuid) from authenticated;
revoke execute on function public.publish_site_content() from authenticated;
