-- Fashion Dream Try-On Shop
-- Schema reference snapshot: AI product vision attributes
-- Supabase project: oazipcrbutizdncctkcg
-- Branch: feature/product-admin
-- IMPORTANT: Reference only. Review public/service-role policy design before production use.

create table if not exists public.product_vision_attributes (
  product_id text primary key references public.products(id) on delete cascade,
  garment_type text not null default 'unknown' check (garment_type = any (array['top','bottom','dress','outerwear','accessory','unknown'])),
  colors jsonb not null default '[]'::jsonb,
  style_tags jsonb not null default '[]'::jsonb,
  material text,
  pattern text,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  provider text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_vision_attributes_garment_type_idx
  on public.product_vision_attributes(garment_type);
create index if not exists product_vision_attributes_provider_idx
  on public.product_vision_attributes(provider);

create or replace function public.set_product_vision_attributes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger product_vision_attributes_updated_at
before update on public.product_vision_attributes
for each row execute function public.set_product_vision_attributes_updated_at();

alter table public.product_vision_attributes enable row level security;

create policy "product vision attributes are publicly readable"
  on public.product_vision_attributes for select
  to public
  using (true);

-- Current production policy uses service-role authorization for management.
-- Prefer a non-exposed schema or explicit server-side path for privileged writes.
create policy "service role manages product vision attributes"
  on public.product_vision_attributes for all
  to public
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');