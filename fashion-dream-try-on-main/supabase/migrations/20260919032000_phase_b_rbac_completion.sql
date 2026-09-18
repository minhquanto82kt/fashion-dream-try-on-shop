-- Complete Phase B RBAC: explicit customer role assignment and back-office capabilities.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.user_roles(user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_user_customer_role ON auth.users;
CREATE TRIGGER trg_auth_user_customer_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

INSERT INTO public.user_roles(user_id, role)
SELECT au.id, 'customer'::public.app_role
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

DROP POLICY IF EXISTS "backoffice can read orders" ON public.orders;
CREATE POLICY "backoffice can read orders" ON public.orders FOR SELECT TO authenticated
USING ((SELECT public.has_backoffice_role('staff')));

DROP POLICY IF EXISTS "backoffice can read order items" ON public.order_items;
CREATE POLICY "backoffice can read order items" ON public.order_items FOR SELECT TO authenticated
USING ((SELECT public.has_backoffice_role('staff')) OR EXISTS (
  SELECT 1 FROM public.orders o WHERE o.id=order_items.order_id AND o.user_id=(SELECT auth.uid())
));

DROP POLICY IF EXISTS "managers can update orders" ON public.orders;

CREATE OR REPLACE FUNCTION public.update_order_status_as_manager(p_order_id uuid, p_order_status text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $$
DECLARE v_updated integer;
BEGIN
  IF NOT (SELECT public.has_backoffice_role('manager')) THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE='42501';
  END IF;
  IF p_order_status NOT IN ('new','confirmed','shipping','completed','cancelled') THEN
    RAISE EXCEPTION 'Trạng thái đơn hàng không hợp lệ.' USING ERRCODE='22023';
  END IF;
  UPDATE public.orders
  SET order_status=p_order_status
  WHERE id=p_order_id
    AND ((order_status='new' AND p_order_status IN ('confirmed','cancelled'))
      OR (order_status='confirmed' AND p_order_status IN ('shipping','cancelled'))
      OR (order_status='shipping' AND p_order_status='completed'));
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated=0 THEN
    RAISE EXCEPTION 'Không thể chuyển trạng thái đơn hàng.' USING ERRCODE='P0003';
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM authenticated;
REVOKE ALL ON FUNCTION public.update_order_status_as_manager(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_order_status_as_manager(uuid,text) FROM anon;
REVOKE ALL ON FUNCTION public.update_order_status_as_manager(uuid,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_order_status_as_manager(uuid,text) TO authenticated;
