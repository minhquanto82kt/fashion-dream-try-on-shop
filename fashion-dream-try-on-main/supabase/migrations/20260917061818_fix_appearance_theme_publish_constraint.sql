create unique index if not exists appearance_themes_published_scope_uidx
on public.appearance_themes (scope)
where status = 'published';

create index if not exists appearance_themes_updated_at_idx
on public.appearance_themes (updated_at desc);
