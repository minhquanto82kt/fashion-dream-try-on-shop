create table if not exists public.appearance_themes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope text not null default 'global' check (scope = 'global'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  theme_data jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.appearance_themes enable row level security;

drop policy if exists "Admins can create appearance themes" on public.appearance_themes;
drop policy if exists "Admins can delete appearance themes" on public.appearance_themes;
drop policy if exists "Admins can update appearance themes" on public.appearance_themes;
drop policy if exists "Public can read published appearance theme" on public.appearance_themes;

create policy "Admins can create appearance themes"
on public.appearance_themes for insert
to authenticated
with check (public.is_admin() and (created_by is null or auth.uid() = created_by));

create policy "Admins can delete appearance themes"
on public.appearance_themes for delete
to authenticated
using (public.is_admin());

create policy "Admins can update appearance themes"
on public.appearance_themes for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read published appearance theme"
on public.appearance_themes for select
to anon, authenticated
using (status = 'published' or public.is_admin());

grant select on public.appearance_themes to anon, authenticated;
grant insert, update, delete on public.appearance_themes to authenticated;

insert into public.appearance_themes (name, scope, status, theme_data, created_by, published_at)
select 'WEARO 2026', 'global', 'published',
       '{"primary":"#F0A500","secondary":"#E6D5B8","background":"#1B1A17","surface":"#24221E","accent":"#E45826","foreground":"#F7F1E7"}'::jsonb,
       null, now()
where not exists (
  select 1 from public.appearance_themes where scope = 'global' and status = 'published'
);
