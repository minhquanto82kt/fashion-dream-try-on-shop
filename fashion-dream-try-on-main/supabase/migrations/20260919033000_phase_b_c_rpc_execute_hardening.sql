-- Phase B/C: keep privileged checkout RPC server-only and customer cancellation authenticated-only.
REVOKE EXECUTE ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.cancel_my_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_my_order(uuid) TO authenticated;
