-- Development-only seed template.
-- Never seed production customer/order/payment/auth data or secrets.

insert into public.products (id,name,description,price,category,slug,short_description,long_description,active,status,featured)
values
 ('FD-DEV-001','Demo Essential Tee','Development-only sample product.',299000,'Tops','demo-essential-tee','Demo product for development.','Development seed record.',true,'published',false),
 ('FD-DEV-002','Demo Relaxed Shirt','Development-only sample product.',499000,'Shirts','demo-relaxed-shirt','Demo product for development.','Development seed record.',true,'published',false)
on conflict (id) do nothing;

insert into public.product_variants (product_id,size,color,sku,stock)
values
 ('FD-DEV-001','M','Black','FD-DEV-001-M-BLK',20),
 ('FD-DEV-001','L','Black','FD-DEV-001-L-BLK',15),
 ('FD-DEV-002','M','White','FD-DEV-002-M-WHT',10),
 ('FD-DEV-002','L','White','FD-DEV-002-L-WHT',8)
on conflict (product_id,size,color) do nothing;

-- Image rows are omitted intentionally; use real development storage assets.
-- Orders/payments are omitted intentionally to preserve clean test history.