create or replace function public.get_published_catalog()
returns table (
  id text,
  name text,
  description text,
  price numeric,
  category text,
  image text,
  featured boolean,
  sizes text[],
  colors text[],
  gallery text[],
  total_stock bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.image,
    p.featured,
    coalesce((select array_agg(distinct v.size order by v.size) from public.product_variants v where v.product_id = p.id), '{}') as sizes,
    coalesce((select array_agg(distinct v.color order by v.color) from public.product_variants v where v.product_id = p.id), '{}') as colors,
    coalesce((select array_agg(pi.image_url order by pi.sort_order, pi.id) from public.product_images pi where pi.product_id = p.id), '{}') as gallery,
    coalesce((select sum(v.stock) from public.product_variants v where v.product_id = p.id), 0) as total_stock
  from public.products p
  where p.active = true and p.status = 'published'
  order by p.created_at desc;
$$;

grant execute on function public.get_published_catalog() to anon, authenticated, service_role;
