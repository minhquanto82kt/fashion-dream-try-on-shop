-- Phase F security hardening applied to the production Supabase project.
-- Keep privileged SECURITY DEFINER functions unreachable from public roles.
REVOKE ALL ON FUNCTION public.enforce_order_transition() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_inventory_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_backoffice_role(public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;

-- These two RPCs are intentionally callable by authenticated users because the
-- function bodies enforce ownership/manager authorization themselves.
REVOKE ALL ON FUNCTION public.cancel_my_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_my_order(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.update_order_status_as_manager(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_order_status_as_manager(uuid,text) TO authenticated;

-- RLS is enabled on this service-owned usage table; explicitly document the
-- service_role policy so the table is not left with zero policies.
DROP POLICY IF EXISTS "service role can manage ai usage" ON public.ai_usage_daily;
CREATE POLICY "service role can manage ai usage"
ON public.ai_usage_daily
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Cover the inventory audit actor foreign key.
CREATE INDEX IF NOT EXISTS inventory_movements_actor_user_id_idx
ON public.inventory_movements(actor_user_id);

-- Keep one canonical order ownership index.
DROP INDEX IF EXISTS public.orders_user_created_idx;
