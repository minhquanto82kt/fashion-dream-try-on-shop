-- Phase C: customer cancellation is a server-side state transition.
-- The orders trigger restores inventory atomically when the order is cancelled.
CREATE OR REPLACE FUNCTION public.cancel_my_order(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE v_status text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED' USING ERRCODE='42501';
  END IF;
  SELECT order_status INTO v_status
  FROM public.orders
  WHERE id=p_order_id AND user_id=(SELECT auth.uid())
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy đơn hàng.' USING ERRCODE='P0001';
  END IF;
  IF v_status NOT IN ('new','confirmed') THEN
    RAISE EXCEPTION 'Đơn hàng không thể hủy ở trạng thái hiện tại.' USING ERRCODE='P0001';
  END IF;
  UPDATE public.orders SET order_status='cancelled' WHERE id=p_order_id AND user_id=(SELECT auth.uid());
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_my_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_my_order(uuid) TO authenticated;
