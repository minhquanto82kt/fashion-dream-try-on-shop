drop function if exists public.publish_appearance_theme(uuid);

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

  if published_id is null then
    insert into public.appearance_themes
      (name, scope, status, theme_data, created_by, created_at, updated_at, published_at)
    values
      (draft_row.name, 'global', 'published', draft_row.theme_data, draft_row.created_by, now(), now(), now())
    returning * into result_row;
  else
    update public.appearance_themes
       set name = draft_row.name,
           theme_data = draft_row.theme_data,
           updated_at = now(),
           published_at = now()
     where id = published_id
    returning * into result_row;
  end if;

  delete from public.appearance_themes where id = draft_row.id;
  return result_row;
end;
$$;

revoke execute on function public.publish_appearance_theme(uuid) from public, anon;
grant execute on function public.publish_appearance_theme(uuid) to authenticated;
