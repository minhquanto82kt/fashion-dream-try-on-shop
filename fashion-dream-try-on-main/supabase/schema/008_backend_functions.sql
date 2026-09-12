-- Fashion Dream Try-On Shop
-- Schema reference snapshot: backend SQL functions / triggers
-- Supabase project: oazipcrbutizdncctkcg
-- Branch: feature/product-admin
-- IMPORTANT: These definitions document the live database. They are not a new
-- migration and must not be executed blindly against production.

-- Product timestamp trigger function
create or replace function public.set_products_updated_at()
returns trigger language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Payment timestamp trigger function
create or replace function public.set_payments_updated_at()
returns trigger language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Try-on timestamp trigger function
create or replace function public.set_try_on_jobs_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Product Vision timestamp trigger function
create or replace function public.set_product_vision_attributes_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Payment audit trigger function
create or replace function public.record_payment_event()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.payment_events (
    payment_id, event_type, old_status, new_status, amount,
    transaction_ref, provider_transaction_id, provider, provider_event_id, metadata
  ) values (
    new.id,
    case when tg_op = 'INSERT' then 'created' else 'status_changed' end,
    case when tg_op = 'INSERT' then null else old.status end,
    new.status,
    new.amount,
    new.transaction_ref,
    new.provider_transaction_id,
    new.provider,
    nullif(new.metadata ->> 'provider_event_id', ''),
    coalesce(new.metadata, '{}'::jsonb)
  )
  on conflict (provider, provider_event_id)
  where provider is not null and provider_event_id is not null do nothing;
  return new;
end;
$$;

-- Keep order payment_status synchronized with payment status.
create or replace function public.sync_order_payment_status()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  update public.orders
  set payment_status = new.status,
      order_status = case
        when new.status = 'paid' and payment_method <> 'cod' and order_status = 'new' then 'confirmed'
        else order_status
      end
  where id = new.order_id;
  return new;
end;
$$;

-- The live database also contains the order/payment RPC layer:
-- create_order_atomic
-- create_payment_for_order
-- verify_payment_status
-- find_sepay_payment
-- process_sepay_payment
-- Their full definitions are preserved in the production migration history.
-- Keep these SECURITY DEFINER functions server-controlled and never expose
-- service credentials to the browser.