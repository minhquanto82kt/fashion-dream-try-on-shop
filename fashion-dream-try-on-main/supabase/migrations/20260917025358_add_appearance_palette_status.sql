alter table public.appearance_palettes
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'archived')),
  add column if not exists archived_at timestamptz;

create index if not exists appearance_palettes_status_idx
  on public.appearance_palettes(status, updated_at desc);

update public.appearance_palettes
set archived_at = coalesce(archived_at, updated_at)
where status = 'archived' and archived_at is null;
