-- Final Phase B/C hardening.
REVOKE ALL ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) FROM anon;
REVOKE ALL ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) TO service_role;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_backoffice_role(public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_order_atomic_v2(
  p_order_code text,p_customer_name text,p_phone text,p_email text,p_address text,
  p_city text,p_district text,p_payment_method text,p_items jsonb,p_note text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE(order_id uuid, order_code text, total integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $$
DECLARE
  v_input jsonb; v_qty integer; v_stock integer; v_item_qty integer; v_price integer;
  v_product_name text; v_subtotal integer:=0; v_shipping_fee integer; v_total integer;
  v_order_id uuid; v_existing public.orders%ROWTYPE; v_variant record;
  v_requested_variants integer; v_matched_variants integer;
BEGIN
  IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) <> '' THEN
    SELECT * INTO v_existing FROM public.orders WHERE idempotency_key=trim(p_idempotency_key) LIMIT 1;
    IF FOUND THEN
      IF p_user_id IS NOT NULL AND v_existing.user_id IS DISTINCT FROM p_user_id THEN
        RAISE EXCEPTION 'Idempotency key đã được sử dụng.' USING ERRCODE='42501';
      END IF;
      RETURN QUERY SELECT v_existing.id,v_existing.order_code,v_existing.total; RETURN;
    END IF;
  END IF;
  IF coalesce(trim(p_order_code),'')='' OR coalesce(trim(p_customer_name),'')='' OR coalesce(trim(p_phone),'')='' OR coalesce(trim(p_address),'')='' OR coalesce(trim(p_city),'')='' OR coalesce(trim(p_district),'')='' THEN
    RAISE EXCEPTION 'Thông tin đơn hàng bắt buộc không được để trống.' USING ERRCODE='22023';
  END IF;
  IF p_payment_method NOT IN ('cod','vietqr','momo') THEN
    RAISE EXCEPTION 'Phương thức thanh toán không hợp lệ.' USING ERRCODE='22023';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items)=0 THEN
    RAISE EXCEPTION 'Đơn hàng phải có ít nhất một sản phẩm.' USING ERRCODE='22023';
  END IF;
  IF jsonb_array_length(p_items)>50 THEN
    RAISE EXCEPTION 'Đơn hàng vượt quá số lượng sản phẩm cho phép.' USING ERRCODE='22023';
  END IF;
  FOR v_input IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF jsonb_typeof(v_input)<>'object' OR coalesce(trim(v_input->>'productId'),'')='' OR coalesce(trim(v_input->>'size'),'')='' OR coalesce(trim(v_input->>'color'),'')='' THEN
      RAISE EXCEPTION 'Dữ liệu sản phẩm không hợp lệ.' USING ERRCODE='22023';
    END IF;
    BEGIN v_qty:=(v_input->>'quantity')::integer; EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Số lượng sản phẩm không hợp lệ.' USING ERRCODE='22023'; END;
    IF v_qty IS NULL OR v_qty<=0 OR v_qty>99 THEN
      RAISE EXCEPTION 'Số lượng sản phẩm phải từ 1 đến 99.' USING ERRCODE='22023';
    END IF;
  END LOOP;

  SELECT count(*) INTO v_requested_variants FROM (
    SELECT DISTINCT trim(e.value->>'productId') product_id, lower(trim(e.value->>'size')) size, lower(trim(e.value->>'color')) color
    FROM jsonb_array_elements(p_items) e
  ) requested;
  SELECT count(*) INTO v_matched_variants FROM (
    SELECT DISTINCT pv2.id FROM jsonb_array_elements(p_items) e
    JOIN public.product_variants pv2 ON pv2.product_id=trim(e.value->>'productId')
      AND lower(trim(pv2.size))=lower(trim(e.value->>'size'))
      AND lower(trim(pv2.color))=lower(trim(e.value->>'color'))
  ) matched;
  IF v_requested_variants <> v_matched_variants THEN
    RAISE EXCEPTION 'Một hoặc nhiều biến thể sản phẩm không tồn tại.' USING ERRCODE='P0001';
  END IF;

  FOR v_variant IN
    SELECT pv.id,pv.product_id,pv.size,pv.color FROM public.product_variants pv
    WHERE pv.id IN (
      SELECT DISTINCT pv2.id FROM jsonb_array_elements(p_items) e
      JOIN public.product_variants pv2 ON pv2.product_id=trim(e.value->>'productId')
       AND lower(trim(pv2.size))=lower(trim(e.value->>'size'))
       AND lower(trim(pv2.color))=lower(trim(e.value->>'color'))
    ) ORDER BY pv.id
  LOOP
    SELECT pv.stock,p.price,p.name INTO v_stock,v_price,v_product_name
    FROM public.product_variants pv JOIN public.products p ON p.id=pv.product_id
    WHERE pv.id=v_variant.id AND p.active=true AND p.status='published' FOR UPDATE OF pv;
    IF NOT FOUND THEN RAISE EXCEPTION 'Biến thể sản phẩm không còn khả dụng.' USING ERRCODE='P0001'; END IF;
    SELECT coalesce(sum((e.value->>'quantity')::integer),0) INTO v_item_qty
    FROM jsonb_array_elements(p_items) e
    WHERE trim(e.value->>'productId')=v_variant.product_id
      AND lower(trim(e.value->>'size'))=lower(trim(v_variant.size))
      AND lower(trim(e.value->>'color'))=lower(trim(v_variant.color));
    IF v_stock<v_item_qty THEN
      RAISE EXCEPTION 'Sản phẩm % (% / %) chỉ còn % sản phẩm trong kho.',v_product_name,v_variant.size,v_variant.color,v_stock USING ERRCODE='P0002';
    END IF;
    v_subtotal:=v_subtotal+(v_price*v_item_qty);
  END LOOP;
  IF v_subtotal<=0 THEN RAISE EXCEPTION 'Tổng tiền sản phẩm không hợp lệ.' USING ERRCODE='22023'; END IF;
  v_shipping_fee:=CASE WHEN v_subtotal>=1000000 THEN 0 ELSE 30000 END;
  v_total:=v_subtotal+v_shipping_fee;

  BEGIN
    INSERT INTO public.orders(order_code,customer_name,phone,email,address,city,district,payment_method,payment_status,order_status,subtotal,shipping_fee,total,note,user_id,idempotency_key)
    VALUES(trim(p_order_code),trim(p_customer_name),trim(p_phone),nullif(trim(coalesce(p_email,'')),''),trim(p_address),trim(p_city),trim(p_district),p_payment_method,'pending','new',v_subtotal,v_shipping_fee,v_total,nullif(trim(coalesce(p_note,'')),''),p_user_id,nullif(trim(coalesce(p_idempotency_key,'')),'')) RETURNING id INTO v_order_id;
  EXCEPTION WHEN unique_violation THEN
    IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) <> '' THEN
      SELECT * INTO v_existing FROM public.orders WHERE idempotency_key=trim(p_idempotency_key) LIMIT 1;
      IF FOUND THEN
        IF p_user_id IS NOT NULL AND v_existing.user_id IS DISTINCT FROM p_user_id THEN
          RAISE EXCEPTION 'Idempotency key đã được sử dụng.' USING ERRCODE='42501';
        END IF;
        RETURN QUERY SELECT v_existing.id,v_existing.order_code,v_existing.total; RETURN;
      END IF;
    END IF;
    RAISE;
  END;

  PERFORM set_config('app.inventory_reason','sale',true);
  PERFORM set_config('app.inventory_order_id',v_order_id::text,true);
  FOR v_variant IN
    SELECT pv.id,pv.product_id,pv.size,pv.color,p.name AS product_name,p.price
    FROM public.product_variants pv JOIN public.products p ON p.id=pv.product_id
    WHERE pv.id IN (
      SELECT DISTINCT pv2.id FROM jsonb_array_elements(p_items) e
      JOIN public.product_variants pv2 ON pv2.product_id=trim(e.value->>'productId')
       AND lower(trim(pv2.size))=lower(trim(e.value->>'size'))
       AND lower(trim(pv2.color))=lower(trim(e.value->>'color'))
    ) ORDER BY pv.id
  LOOP
    SELECT coalesce(sum((e.value->>'quantity')::integer),0) INTO v_item_qty
    FROM jsonb_array_elements(p_items) e
    WHERE trim(e.value->>'productId')=v_variant.product_id
      AND lower(trim(e.value->>'size'))=lower(trim(v_variant.size))
      AND lower(trim(e.value->>'color'))=lower(trim(v_variant.color));
    INSERT INTO public.order_items(order_id,product_id,product_name,size,color,quantity,unit_price,variant_id)
    VALUES(v_order_id,v_variant.product_id,v_variant.product_name,v_variant.size,v_variant.color,v_item_qty,v_variant.price,v_variant.id);
    UPDATE public.product_variants SET stock=stock-v_item_qty WHERE id=v_variant.id;
  END LOOP;
  INSERT INTO public.payments(order_id,method,status,amount,provider)
  VALUES(v_order_id,p_payment_method,'pending',v_total,CASE WHEN p_payment_method='vietqr' THEN 'sepay' WHEN p_payment_method='momo' THEN 'momo' ELSE 'cod' END);
  RETURN QUERY SELECT v_order_id,trim(p_order_code),v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) FROM anon;
REVOKE ALL ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) TO service_role;
