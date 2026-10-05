create table public.journal_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'STYLE GUIDE',
  excerpt text not null default '',
  content text not null default '',
  image_url text,
  seo_title text not null default '',
  seo_description text not null default '',
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  scheduled_at timestamptz,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_scheduled_requires_date check (status <> 'scheduled' or scheduled_at is not null)
);

create index journal_articles_status_idx on public.journal_articles(status);
create index journal_articles_scheduled_at_idx on public.journal_articles(scheduled_at);
create index journal_articles_published_at_idx on public.journal_articles(published_at desc);

alter table public.journal_articles enable row level security;

revoke insert, update, delete on table public.journal_articles from anon;
grant select on table public.journal_articles to anon;
grant select, insert, update, delete on table public.journal_articles to authenticated;

create policy "Public can read published journal articles"
on public.journal_articles
for select
to anon, authenticated
using (
  status = 'published'
  or (status = 'scheduled' and scheduled_at is not null and scheduled_at <= now())
);

create policy "Admins can read all journal articles"
on public.journal_articles
for select
to authenticated
using ((select is_admin()));

create policy "Admins can create journal articles"
on public.journal_articles
for insert
to authenticated
with check ((select is_admin()) and ((created_by is null) or (select auth.uid()) = created_by));

create policy "Admins can update journal articles"
on public.journal_articles
for update
to authenticated
using ((select is_admin()))
with check ((select is_admin()));

create policy "Admins can delete journal articles"
on public.journal_articles
for delete
to authenticated
using ((select is_admin()));

create or replace function public.set_journal_articles_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journal_articles_set_updated_at on public.journal_articles;
create trigger journal_articles_set_updated_at
before update on public.journal_articles
for each row execute function public.set_journal_articles_updated_at();
