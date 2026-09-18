-- Phase C fulfillment hardening: safe order transitions and stock restoration on cancellation.

CREATE OR REPLACE FUNCTION public.enforce_order_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE v_item record;
BEGIN
  IF NEW.order_status = OLD.order_status THEN RETURN NEW; END IF;
  IF OLD.order_status IN ('completed','cancelled') THEN
    RAISE EXCEPTION 'Đơn hàng đã kết thúc, không thể chuyển trạng thái.' USING ERRCODE='P0001';
  END IF;
  IF NEW.order_status='cancelled' AND OLD.order_status NOT IN ('new','confirmed') THEN
    RAISE EXCEPTION 'Chỉ có thể hủy đơn ở trạng thái mới hoặc đã xác nhận.' USING ERRCODE='P0001';
  END IF;
  IF NEW.order_status='completed' AND OLD.order_status<>'shipping' THEN
    RAISE EXCEPTION 'Chỉ có thể hoàn tất đơn đang giao.' USING ERRCODE='P0001';
  END IF;
  IF NEW.order_status='shipping' AND OLD.order_status NOT IN ('new','confirmed') THEN
    RAISE EXCEPTION 'Đơn hàng phải được xác nhận trước khi chuyển sang giao.' USING ERRCODE='P0001';
  END IF;
  IF NEW.order_status='confirmed' AND OLD.order_status<>'new' THEN
    RAISE EXCEPTION 'Chỉ đơn mới có thể được xác nhận.' USING ERRCODE='P0001';
  END IF;
  IF NEW.order_status='cancelled' THEN
    PERFORM set_config('app.inventory_reason','return',true);
    PERFORM set_config('app.inventory_order_id',NEW.id::text,true);
    FOR v_item IN
      SELECT oi.variant_id,sum(oi.quantity)::integer AS quantity
      FROM public.order_items oi
      WHERE oi.order_id=OLD.id AND oi.variant_id IS NOT NULL
      GROUP BY oi.variant_id
    LOOP
      UPDATE public.product_variants SET stock=stock+v_item.quantity WHERE id=v_item.variant_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_enforce_transition ON public.orders;
CREATE TRIGGER trg_orders_enforce_transition
BEFORE UPDATE OF order_status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_transition();

CREATE INDEX IF NOT EXISTS orders_status_created_idx
ON public.orders(order_status,created_at DESC);
