-- Preserve published theme snapshots as immutable history instead of overwriting them.
alter table public.appearance_themes
  drop constraint if exists appearance_themes_status_check;

alter table public.appearance_themes
  add constraint appearance_themes_status_check
  check (status in ('draft', 'published', 'archived'));

create or replace function public.publish_appearance_theme(p_draft_id uuid)
returns public.appearance_themes
language plpgsql
security definer
set search_path = ''
as $$
declare
  draft_row public.appearance_themes%rowtype;
  published_id uuid;
  result_row public.appearance_themes%rowtype;
begin
  if not (select public.is_admin()) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select * into draft_row
  from public.appearance_themes
  where id = p_draft_id and scope = 'global' and status = 'draft'
  for update;

  if not found then
    raise exception 'Draft theme not found' using errcode = 'P0002';
  end if;

  select id into published_id
  from public.appearance_themes
  where scope = 'global' and status = 'published'
  order by updated_at desc
  limit 1
  for update;

  if published_id is not null then
    update public.appearance_themes
       set status = 'archived',
           updated_at = now()
     where id = published_id;
  end if;

  update public.appearance_themes
     set status = 'published',
         updated_at = now(),
         published_at = now()
   where id = draft_row.id
  returning * into result_row;

  return result_row;
end;
$$;

revoke execute on function public.publish_appearance_theme(uuid) from anon;
grant execute on function public.publish_appearance_theme(uuid) to authenticated;
