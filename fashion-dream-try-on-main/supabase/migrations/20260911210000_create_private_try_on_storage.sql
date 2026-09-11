-- Private storage for AI Try-On assets.
-- The Python backend uses the server-side Supabase credential to write files.
-- Client access should use authenticated requests or short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'try-on-assets',
  'try-on-assets',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
