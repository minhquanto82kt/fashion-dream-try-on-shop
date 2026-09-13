-- Fashion Dream Try-On Shop | persistent public site branding
-- Stores the active logo URL while the binary asset lives in Supabase Storage.

create table if not exists public.site_branding (
  id text primary key,
  logo_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_branding (id)
values ('global')
on conflict (id) do nothing;

-- Explicit Data API grants are required for new public tables under Supabase's
-- 2026 Data API exposure changes. RLS remains the authorization boundary.
grant select on public.site_branding to anon, authenticated;
grant update on public.site_branding to authenticated;

alter table public.site_branding enable row level security;

-- The active logo is public website content and may be read by visitors.
drop policy if exists "site branding public read" on public.site_branding;
create policy "site branding public read"
on public.site_branding
for select
to anon, authenticated
using (true);

-- Only an authenticated admin can change the active logo.
drop policy if exists "site branding admin update" on public.site_branding;
create policy "site branding admin update"
on public.site_branding
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Storage bucket for the single active site logo. Public read is intentional;
-- write operations remain protected by storage.objects RLS policies below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-branding',
  'site-branding',
  true,
  2097152,
  array['image/png','image/jpeg','image/webp','image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public website can retrieve the active logo.
drop policy if exists "site branding logo public read" on storage.objects;
create policy "site branding logo public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-branding' and name = 'logo');

-- Admin-only create/replace/delete for the fixed logo object.
drop policy if exists "site branding logo admin insert" on storage.objects;
create policy "site branding logo admin insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-branding'
  and name = 'logo'
  and (select public.is_admin())
);

drop policy if exists "site branding logo admin update" on storage.objects;
create policy "site branding logo admin update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-branding'
  and name = 'logo'
  and (select public.is_admin())
)
with check (
  bucket_id = 'site-branding'
  and name = 'logo'
  and (select public.is_admin())
);

drop policy if exists "site branding logo admin delete" on storage.objects;
create policy "site branding logo admin delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-branding'
  and name = 'logo'
  and (select public.is_admin())
);
