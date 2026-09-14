-- Customer order history support
-- 1) Optional user_id on orders (links checkout to logged-in customer)
-- 2) Index for fast lookups by user_id / email
-- Apply on Supabase when ready. App already falls back to email match via service role.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx
  ON public.orders (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_email_created_at_idx
  ON public.orders (lower(email), created_at DESC)
  WHERE email IS NOT NULL;

-- Optional: allow create_order_atomic to accept p_user_id (no-op if RPC body ignores extra keys).
-- If your create_order_atomic is a fixed-arg function, extend it separately, e.g.:
--   p_user_id uuid DEFAULT NULL
-- and INSERT ... user_id = p_user_id

COMMENT ON COLUMN public.orders.user_id IS 'Logged-in customer (auth.users.id); nullable for guest checkout';
