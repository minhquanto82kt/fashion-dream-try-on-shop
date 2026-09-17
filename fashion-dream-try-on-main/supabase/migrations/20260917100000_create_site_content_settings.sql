create table if not exists public.site_content_settings (
  id text primary key default 'global',
  announcement_enabled boolean not null default false,
  announcement_text text not null default '',
  hero_eyebrow text not null default 'WEARO / 2026',
  hero_title text not null default 'Mặc theo cách của riêng bạn',
  hero_description text not null default 'Discover a wardrobe shaped around your identity.',
  hero_cta_label text not null default 'EXPLORE COLLECTION',
  hero_cta_url text not null default '/shop',
  social_title text not null default 'WEARO — Wear it your way',
  social_description text not null default 'Modern unisex fashion with AI-powered try-on.',
  favicon_url text,
  social_image_url text,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_content_settings_singleton check (id = 'global')
);

alter table public.site_content_settings enable row level security;

create policy "site_content_settings_public_read" on public.site_content_settings
  for select to anon, authenticated using (true);

create policy "site_content_settings_admin_insert" on public.site_content_settings
  for insert to authenticated with check (public.is_admin() and auth.uid() = updated_by);

create policy "site_content_settings_admin_update" on public.site_content_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_content_settings (id)
values ('global')
on conflict (id) do nothing;

create index if not exists site_content_settings_updated_at_idx on public.site_content_settings (updated_at desc);
