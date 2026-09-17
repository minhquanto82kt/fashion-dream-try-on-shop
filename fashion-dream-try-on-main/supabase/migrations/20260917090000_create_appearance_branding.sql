create table if not exists public.appearance_branding (
  id text primary key check (id = 'global'),
  brand_name text not null check (char_length(trim(brand_name)) between 1 and 80),
  monogram text not null check (char_length(trim(monogram)) between 1 and 4),
  social_title text not null check (char_length(trim(social_title)) between 1 and 120),
  social_description text not null check (char_length(trim(social_description)) between 1 and 200),
  updated_at timestamptz not null default now()
);

alter table public.appearance_branding enable row level security;

drop policy if exists "Public can read appearance branding" on public.appearance_branding;
drop policy if exists "Admins can create appearance branding" on public.appearance_branding;
drop policy if exists "Admins can update appearance branding" on public.appearance_branding;
drop policy if exists "Admins can delete appearance branding" on public.appearance_branding;

create policy "Public can read appearance branding"
on public.appearance_branding for select
to anon, authenticated
using (true);

create policy "Admins can create appearance branding"
on public.appearance_branding for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update appearance branding"
on public.appearance_branding for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete appearance branding"
on public.appearance_branding for delete
to authenticated
using (public.is_admin());

grant select on public.appearance_branding to anon, authenticated;
grant insert, update, delete on public.appearance_branding to authenticated;

insert into public.appearance_branding (id, brand_name, monogram, social_title, social_description)
values ('global', 'WEARO', 'WO', 'WEARO — AI Try-On', 'Wear it your way with AI-powered virtual try-on.')
on conflict (id) do nothing;
