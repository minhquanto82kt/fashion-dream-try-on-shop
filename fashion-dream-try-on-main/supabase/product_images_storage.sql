-- UpThink Product Admin image storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images','product-images',true,10485760,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=true,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "admins can upload product images" on storage.objects;
drop policy if exists "admins can update product images storage" on storage.objects;
drop policy if exists "admins can delete product images storage" on storage.objects;

create policy "admins can upload product images" on storage.objects
for insert to authenticated
with check (bucket_id='product-images' and (select public.is_admin()));

create policy "admins can update product images storage" on storage.objects
for update to authenticated
using (bucket_id='product-images' and (select public.is_admin()))
with check (bucket_id='product-images' and (select public.is_admin()));

create policy "admins can delete product images storage" on storage.objects
for delete to authenticated
using (bucket_id='product-images' and (select public.is_admin()));

revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
