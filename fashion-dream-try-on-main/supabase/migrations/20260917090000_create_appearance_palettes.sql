create table if not exists public.appearance_palettes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  primary_color text not null check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text not null check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_color text not null check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  surface_color text not null check (surface_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text not null check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  foreground_color text not null check (foreground_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appearance_palettes enable row level security;

create policy "Admins can read appearance palettes"
on public.appearance_palettes for select
to authenticated
using (public.is_admin());

create policy "Admins can create appearance palettes"
on public.appearance_palettes for insert
to authenticated
with check (public.is_admin() and auth.uid() = created_by);

create policy "Admins can update appearance palettes"
on public.appearance_palettes for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete appearance palettes"
on public.appearance_palettes for delete
to authenticated
using (public.is_admin());

create index if not exists appearance_palettes_created_at_idx
  on public.appearance_palettes(created_at desc);

create index if not exists appearance_palettes_name_idx
  on public.appearance_palettes(lower(name));
