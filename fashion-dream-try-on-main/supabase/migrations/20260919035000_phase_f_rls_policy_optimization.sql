-- Phase F: consolidate overlapping permissive SELECT policies.
-- Keep the same effective access while reducing duplicate policy evaluation.
DROP POLICY IF EXISTS "backoffice can read orders" ON public.orders;
DROP POLICY IF EXISTS "customers and admins can read orders" ON public.orders;
CREATE POLICY "orders select by owner or backoffice"
ON public.orders FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  OR (SELECT public.has_backoffice_role('staff'::public.app_role))
);

DROP POLICY IF EXISTS "backoffice can read order items" ON public.order_items;
DROP POLICY IF EXISTS "customers and admins can read order items" ON public.order_items;
CREATE POLICY "order items select by owner or backoffice"
ON public.order_items FOR SELECT TO authenticated
USING (
  (SELECT public.has_backoffice_role('staff'::public.app_role))
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND ((o.user_id = (SELECT auth.uid())) OR (SELECT public.is_admin()))
  )
);

DROP POLICY IF EXISTS "managers can read payments" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_select" ON public.payments;
CREATE POLICY "payments select by backoffice"
ON public.payments FOR SELECT TO authenticated
USING ((SELECT public.has_backoffice_role('manager'::public.app_role)));
