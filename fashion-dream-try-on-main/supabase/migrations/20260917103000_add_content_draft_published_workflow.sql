alter table public.site_content_settings
  add column if not exists draft_content jsonb,
  add column if not exists published_content jsonb;

update public.site_content_settings
set
  draft_content = coalesce(draft_content, jsonb_build_object(
    'announcement_enabled', announcement_enabled,
    'announcement_text', announcement_text,
    'hero_eyebrow', hero_eyebrow,
    'hero_title', hero_title,
    'hero_description', hero_description,
    'hero_cta_label', hero_cta_label,
    'hero_cta_url', hero_cta_url,
    'social_title', social_title,
    'social_description', social_description,
    'favicon_url', favicon_url,
    'social_image_url', social_image_url
  )),
  published_content = coalesce(published_content, jsonb_build_object(
    'announcement_enabled', announcement_enabled,
    'announcement_text', announcement_text,
    'hero_eyebrow', hero_eyebrow,
    'hero_title', hero_title,
    'hero_description', hero_description,
    'hero_cta_label', hero_cta_label,
    'hero_cta_url', hero_cta_url,
    'social_title', social_title,
    'social_description', social_description,
    'favicon_url', favicon_url,
    'social_image_url', social_image_url
  ));

create or replace function public.publish_site_content()
returns public.site_content_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data public.site_content_settings;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  update public.site_content_settings
  set
    published_content = draft_content,
    announcement_enabled = coalesce((draft_content->>'announcement_enabled')::boolean, announcement_enabled),
    announcement_text = coalesce(draft_content->>'announcement_text', announcement_text),
    hero_eyebrow = coalesce(draft_content->>'hero_eyebrow', hero_eyebrow),
    hero_title = coalesce(draft_content->>'hero_title', hero_title),
    hero_description = coalesce(draft_content->>'hero_description', hero_description),
    hero_cta_label = coalesce(draft_content->>'hero_cta_label', hero_cta_label),
    hero_cta_url = coalesce(draft_content->>'hero_cta_url', hero_cta_url),
    social_title = coalesce(draft_content->>'social_title', social_description),
    social_description = coalesce(draft_content->>'social_description', social_description),
    favicon_url = nullif(draft_content->>'favicon_url', ''),
    social_image_url = nullif(draft_content->>'social_image_url', ''),
    updated_by = auth.uid(),
    updated_at = now()
  where id = 'global'
  returning * into row_data;

  return row_data;
end;
$$;

grant execute on function public.publish_site_content() to authenticated;

create or replace function public.discard_site_content_draft()
returns public.site_content_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data public.site_content_settings;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  update public.site_content_settings
  set draft_content = published_content,
      updated_by = auth.uid(),
      updated_at = now()
  where id = 'global'
  returning * into row_data;

  return row_data;
end;
$$;

grant execute on function public.discard_site_content_draft() to authenticated;
