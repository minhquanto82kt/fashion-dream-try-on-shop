-- Read-only Supabase database audit.
-- Run in a privileged SQL editor/session against the target environment.
-- This script intentionally performs no INSERT/UPDATE/DELETE/DDL.

with expected_tables(schema_name, table_name) as (
  values
    ('public','products'),
    ('public','product_variants'),
    ('public','product_images'),
    ('public','orders'),
    ('public','order_items'),
    ('public','payments'),
    ('public','payment_events'),
    ('public','admin_users'),
    ('public','try_on_jobs'),
    ('public','product_vision_attributes'),
    ('public','site_branding')
),
table_checks as (
  select
    e.schema_name,
    e.table_name,
    case when c.oid is not null then 'PASS' else 'FAIL' end as status,
    case when c.oid is not null then 'table exists' else 'missing table' end as detail
  from expected_tables e
  left join pg_class c
    on c.relname = e.table_name
   and c.relnamespace = to_regnamespace(e.schema_name)
   and c.relkind = 'r'
),
rls_checks as (
  select
    e.schema_name,
    e.table_name,
    case when c.relrowsecurity then 'PASS' else 'FAIL' end as status,
    case when c.relrowsecurity then 'RLS enabled' else 'RLS disabled' end as detail
  from expected_tables e
  join pg_class c
    on c.relname = e.table_name
   and c.relnamespace = to_regnamespace(e.schema_name)
   and c.relkind = 'r'
)
select 'table' as check_type, schema_name, table_name, status, detail from table_checks
union all
select 'rls' as check_type, schema_name, table_name, status, detail from rls_checks
order by check_type, table_name;

-- High-value integrity checks.
select
  'products_slug_unique' as check_name,
  case when exists (
    select 1 from pg_indexes
    where schemaname='public'
      and indexname='products_slug_unique'
  ) then 'PASS' else 'FAIL' end as status;

select
  'product_variants_stock_nonnegative' as check_name,
  case when exists (
    select 1 from information_schema.check_constraints
    where constraint_schema='public'
      and constraint_name in (
        select constraint_name
        from information_schema.constraint_column_usage
        where table_schema='public' and table_name='product_variants' and column_name='stock'
      )
  ) then 'PASS' else 'REVIEW' end as status;

select
  'payments_one_per_order' as check_name,
  case when exists (
    select 1 from pg_indexes
    where schemaname='public'
      and indexname like 'payments%'
      and indexdef ilike '%unique%'
      and indexdef ilike '%order_id%'
  ) then 'PASS' else 'REVIEW' end as status;

select
  'product_images_one_primary' as check_name,
  case when exists (
    select 1 from pg_indexes
    where schemaname='public'
      and indexname='product_images_one_primary'
  ) then 'PASS' else 'REVIEW' end as status;

select
  'admin_users_is_admin_function' as check_name,
  case when to_regprocedure('public.is_admin()') is not null then 'PASS' else 'FAIL' end as status;

select
  'atomic_order_rpc_present' as check_name,
  case when to_regprocedure('public.create_order_atomic') is not null then 'PASS' else 'REVIEW' end as status;

select
  'payment_verification_rpc_present' as check_name,
  case when to_regprocedure('public.verify_payment_status') is not null then 'PASS' else 'REVIEW' end as status;

-- Review these results together with pg_policies and storage.objects policies.
-- A PASS here does not prove that the complete live RLS policy set is correct.
