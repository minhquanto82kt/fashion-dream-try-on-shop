-- Appearance P1-B: brand assets + commerce-facing content controls.
-- Extends the existing global appearance_branding record without changing theme workflow tables.

create table if not exists public.appearance_branding (
  id text primary key default 'global',
  brand_name text not null default 'WEARO',
  monogram text not null default 'WO',
  social_title text not null default 'WEARO — AI Try-On',
  social_description text not null default 'Wear it your way with AI-powered virtual try-on.',
  updated_at timestamptz not null default now()
);

alter table public.appearance_branding
  add column if not exists dark_logo_url text,
  add column if not exists monogram_url text,
  add column if not exists social_image_url text,
  add column if not exists announcement_enabled boolean not null default true,
  add column if not exists announcement_text text not null default 'AI TRY-ON (BETA) · WEAR IT YOUR WAY',
  add column if not exists hero_eyebrow text not null default 'WEARO / AI FASHION SYSTEM',
  add column if not exists hero_title text not null default 'WEAR YOUR OWN STORY.',
  add column if not exists hero_description text not null default 'Virtual try-on and personalized styling for a more confident way to shop fashion online.',
  add column if not exists hero_primary_cta text not null default 'START AI TRY-ON',
  add column if not exists hero_secondary_cta text not null default 'EXPLORE COLLECTION';

insert into public.appearance_branding (id)
values ('global')
on conflict (id) do nothing;

alter table public.appearance_branding enable row level security;

drop policy if exists "appearance branding public read" on public.appearance_branding;
create policy "appearance branding public read"
on public.appearance_branding
for select
using (true);

drop policy if exists "appearance branding admin write" on public.appearance_branding;
create policy "appearance branding admin write"
on public.appearance_branding
for all
to authenticated
using (public.authenticated_is_admin())
with check (public.authenticated_is_admin());
