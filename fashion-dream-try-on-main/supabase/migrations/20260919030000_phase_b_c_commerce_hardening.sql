-- Phase B + C: authorization hierarchy, cart source-of-truth, inventory audit,
-- and idempotent atomic checkout.

DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('customer','staff','manager','admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can read own role" ON public.user_roles;
CREATE POLICY "users can read own role" ON public.user_roles FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
DROP POLICY IF EXISTS "admins can insert user roles" ON public.user_roles;
CREATE POLICY "admins can insert user roles" ON public.user_roles FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));
DROP POLICY IF EXISTS "admins can update user roles" ON public.user_roles;
CREATE POLICY "admins can update user roles" ON public.user_roles FOR UPDATE TO authenticated
USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
DROP POLICY IF EXISTS "admins can delete user roles" ON public.user_roles;
CREATE POLICY "admins can delete user roles" ON public.user_roles FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

CREATE OR REPLACE FUNCTION public.has_backoffice_role(required_role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT auth.uid()) AND ur.role >= required_role
  ) OR (
    required_role = 'admin' AND EXISTS (
      SELECT 1 FROM public.admin_users au WHERE au.user_id = (SELECT auth.uid())
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = (SELECT auth.uid()))
      OR EXISTS (SELECT 1 FROM public.user_roles ur
                 WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'admin');
$$;

-- Close authenticated INSERT loopholes on catalog tables.
DROP POLICY IF EXISTS "admins can insert products" ON public.products;
CREATE POLICY "admins can insert products" ON public.products FOR INSERT TO authenticated
WITH CHECK ((SELECT public.has_backoffice_role('admin')));
DROP POLICY IF EXISTS "admins can update products" ON public.products;
CREATE POLICY "admins can update products" ON public.products FOR UPDATE TO authenticated
USING ((SELECT public.has_backoffice_role('admin'))) WITH CHECK ((SELECT public.has_backoffice_role('admin')));
DROP POLICY IF EXISTS "admins can delete products" ON public.products;
CREATE POLICY "admins can delete products" ON public.products FOR DELETE TO authenticated
USING ((SELECT public.has_backoffice_role('admin')));

DROP POLICY IF EXISTS "admins can insert product variants" ON public.product_variants;
CREATE POLICY "admins can insert product variants" ON public.product_variants FOR INSERT TO authenticated
WITH CHECK ((SELECT public.has_backoffice_role('admin')));
DROP POLICY IF EXISTS "admins can update product variants" ON public.product_variants;
CREATE POLICY "admins can update product variants" ON public.product_variants FOR UPDATE TO authenticated
USING ((SELECT public.has_backoffice_role('admin'))) WITH CHECK ((SELECT public.has_backoffice_role('admin')));
DROP POLICY IF EXISTS "admins can delete product variants" ON public.product_variants;
CREATE POLICY "admins can delete product variants" ON public.product_variants FOR DELETE TO authenticated
USING ((SELECT public.has_backoffice_role('admin')));

DROP POLICY IF EXISTS "admins can insert product images" ON public.product_images;
CREATE POLICY "admins can insert product images" ON public.product_images FOR INSERT TO authenticated
WITH CHECK ((SELECT public.has_backoffice_role('admin')));
DROP POLICY IF EXISTS "admins can update product images" ON public.product_images;
CREATE POLICY "admins can update product images" ON public.product_images FOR UPDATE TO authenticated
USING ((SELECT public.has_backoffice_role('admin'))) WITH CHECK ((SELECT public.has_backoffice_role('admin')));
DROP POLICY IF EXISTS "admins can delete product images" ON public.product_images;
CREATE POLICY "admins can delete product images" ON public.product_images FOR DELETE TO authenticated
USING ((SELECT public.has_backoffice_role('admin')));

-- Server-backed authenticated cart.
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 99),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cart_id, variant_id)
);
CREATE INDEX IF NOT EXISTS carts_user_id_idx ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS cart_items_variant_id_idx ON public.cart_items(variant_id);
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users manage own carts" ON public.carts;
CREATE POLICY "users manage own carts" ON public.carts FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "users manage own cart items" ON public.cart_items;
CREATE POLICY "users manage own cart items" ON public.cart_items FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));

-- Inventory source of truth remains product_variants.stock; this is its audit ledger.
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  delta integer NOT NULL CHECK (delta <> 0),
  stock_before integer NOT NULL CHECK (stock_before >= 0),
  stock_after integer NOT NULL CHECK (stock_after >= 0),
  reason text NOT NULL CHECK (reason IN ('sale','manual_adjustment','restock','return','correction')),
  order_id uuid NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  actor_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_movements_variant_created_idx
ON public.inventory_movements(variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS inventory_movements_order_idx
ON public.inventory_movements(order_id) WHERE order_id IS NOT NULL;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "backoffice can read inventory movements" ON public.inventory_movements;
CREATE POLICY "backoffice can read inventory movements" ON public.inventory_movements FOR SELECT TO authenticated
USING ((SELECT public.has_backoffice_role('staff')));

CREATE OR REPLACE FUNCTION public.log_inventory_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $$
DECLARE v_reason text; v_order_id uuid;
BEGIN
  IF NEW.stock IS DISTINCT FROM OLD.stock THEN
    v_reason := COALESCE(NULLIF(current_setting('app.inventory_reason', true), ''), 'manual_adjustment');
    v_order_id := NULLIF(current_setting('app.inventory_order_id', true), '')::uuid;
    INSERT INTO public.inventory_movements
      (variant_id,delta,stock_before,stock_after,reason,order_id,actor_user_id,metadata)
    VALUES
      (NEW.id,NEW.stock-OLD.stock,OLD.stock,NEW.stock,v_reason,v_order_id,(SELECT auth.uid()),'{}'::jsonb);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_product_variant_inventory_audit ON public.product_variants;
CREATE TRIGGER trg_product_variant_inventory_audit AFTER UPDATE OF stock ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.log_inventory_change();

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_uidx
ON public.orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_created_idx
ON public.orders(user_id, created_at DESC) WHERE user_id IS NOT NULL;

DROP FUNCTION IF EXISTS public.create_order_atomic(text,text,text,text,text,text,text,text,jsonb,text);
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
  INSERT INTO public.orders(order_code,customer_name,phone,email,address,city,district,payment_method,payment_status,order_status,subtotal,shipping_fee,total,note,user_id,idempotency_key)
  VALUES(trim(p_order_code),trim(p_customer_name),trim(p_phone),nullif(trim(coalesce(p_email,'')),''),trim(p_address),trim(p_city),trim(p_district),p_payment_method,'pending','new',v_subtotal,v_shipping_fee,v_total,nullif(trim(coalesce(p_note,'')),''),p_user_id,nullif(trim(coalesce(p_idempotency_key,'')),'')) RETURNING id INTO v_order_id;
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
GRANT EXECUTE ON FUNCTION public.create_order_atomic_v2(text,text,text,text,text,text,text,text,jsonb,text,uuid,text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.has_backoffice_role(public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_backoffice_role(public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
