import { createServerFn } from "@tanstack/react-start";
import { supabaseUserRequest } from "./supabase-user.server";
import { fetchWithTimeoutAndRetry } from "./server-reliability";

type AuthUser = { id: string };
type CartRow = { id: string; user_id: string; created_at: string; updated_at: string };
type CartItemRow = { id: string; cart_id: string; variant_id: string; quantity: number; created_at: string; updated_at: string };
type VariantRow = { id: string; product_id: string; size: string; color: string; sku: string | null; stock: number; product?: { name: string; price: number; image: string | null } };

async function resolveUser(accessToken: string): Promise<AuthUser> {
  const token = accessToken.trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Thiếu cấu hình Supabase trên server.");
  const response = await fetchWithTimeoutAndRetry(`${url}/auth/v1/user`, { headers: { apikey: secretKey, Authorization: `Bearer ${token}` } });
  if (response.status === 401 || response.status === 403) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error("Không thể xác minh phiên đăng nhập.");
  const user = (await response.json()) as AuthUser;
  if (!user?.id) throw new Error("UNAUTHORIZED");
  return user;
}

async function getOrCreateCart(userId: string, accessToken: string): Promise<CartRow> {
  const existing = await supabaseUserRequest<CartRow[]>(`carts?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`, accessToken);
  if (existing[0]) return existing[0];
  const created = await supabaseUserRequest<CartRow[]>("carts", accessToken, { method: "POST", body: JSON.stringify({ user_id: userId }) });
  if (!created[0]) throw new Error("Không thể tạo giỏ hàng.");
  return created[0];
}

async function getCartForUser(userId: string, accessToken: string) {
  const cart = await getOrCreateCart(userId, accessToken);
  const items = await supabaseUserRequest<CartItemRow[]>(`cart_items?cart_id=eq.${encodeURIComponent(cart.id)}&select=*&order=created_at.asc`, accessToken);
  if (!items.length) return { cart, items: [] as Array<CartItemRow & { variant: VariantRow | null }> };
  const variantIds = [...new Set(items.map((item) => item.variant_id))];
  const variants = await supabaseUserRequest<VariantRow[]>(`product_variants?id=in.(${variantIds.join(",")})&select=id,product_id,size,color,sku,stock,product:products(name,price,image)`, accessToken);
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  return { cart, items: items.map((item) => ({ ...item, variant: variantMap.get(item.variant_id) ?? null })) };
}

export const getServerCart = createServerFn({ method: "POST" }).validator((data: { accessToken: string }) => data).handler(async ({ data }) => { const user = await resolveUser(data.accessToken); return getCartForUser(user.id, data.accessToken); });

export const addServerCartItem = createServerFn({ method: "POST" }).validator((data: { accessToken: string; variantId: string; quantity: number }) => data).handler(async ({ data }) => {
  if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 99) throw new Error("Số lượng không hợp lệ.");
  const user = await resolveUser(data.accessToken);
  const cart = await getOrCreateCart(user.id, data.accessToken);
  const variants = await supabaseUserRequest<VariantRow[]>(`product_variants?id=eq.${encodeURIComponent(data.variantId)}&select=id,product_id,size,color,sku,stock,product:products(name,price,image)&limit=1`, data.accessToken);
  const variant = variants[0];
  if (!variant) throw new Error("Không tìm thấy biến thể sản phẩm.");
  if (variant.stock < data.quantity) throw new Error(`Chỉ còn ${variant.stock} sản phẩm trong kho.`);
  const existing = await supabaseUserRequest<CartItemRow[]>(`cart_items?cart_id=eq.${encodeURIComponent(cart.id)}&variant_id=eq.${encodeURIComponent(data.variantId)}&select=*&limit=1`, data.accessToken);
  const nextQuantity = (existing[0]?.quantity ?? 0) + data.quantity;
  if (nextQuantity > 99 || nextQuantity > variant.stock) throw new Error("Số lượng vượt quá tồn kho.");
  if (existing[0]) await supabaseUserRequest(`cart_items?id=eq.${encodeURIComponent(existing[0].id)}&cart_id=eq.${encodeURIComponent(cart.id)}`, data.accessToken, { method: "PATCH", body: JSON.stringify({ quantity: nextQuantity, updated_at: new Date().toISOString() }) });
  else await supabaseUserRequest("cart_items", data.accessToken, { method: "POST", body: JSON.stringify({ cart_id: cart.id, variant_id: data.variantId, quantity: data.quantity }) });
  return getCartForUser(user.id, data.accessToken);
});

export const updateServerCartItem = createServerFn({ method: "POST" }).validator((data: { accessToken: string; itemId: string; quantity: number }) => data).handler(async ({ data }) => {
  if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 99) throw new Error("Số lượng không hợp lệ.");
  const user = await resolveUser(data.accessToken);
  const cart = await getOrCreateCart(user.id, data.accessToken);
  const items = await supabaseUserRequest<CartItemRow[]>(`cart_items?id=eq.${encodeURIComponent(data.itemId)}&cart_id=eq.${encodeURIComponent(cart.id)}&select=*&limit=1`, data.accessToken);
  if (!items[0]) throw new Error("Sản phẩm không thuộc giỏ hàng của bạn.");
  const variants = await supabaseUserRequest<VariantRow[]>(`product_variants?id=eq.${encodeURIComponent(items[0].variant_id)}&select=id,product_id,size,color,sku,stock,product:products(name,price,image)&limit=1`, data.accessToken);
  if (!variants[0]) throw new Error("Biến thể sản phẩm không còn tồn tại.");
  if (data.quantity > variants[0].stock) throw new Error(`Chỉ còn ${variants[0].stock} sản phẩm trong kho.`);
  await supabaseUserRequest(`cart_items?id=eq.${encodeURIComponent(data.itemId)}&cart_id=eq.${encodeURIComponent(cart.id)}`, data.accessToken, { method: "PATCH", body: JSON.stringify({ quantity: data.quantity, updated_at: new Date().toISOString() }) });
  return getCartForUser(user.id, data.accessToken);
});

export const removeServerCartItem = createServerFn({ method: "POST" }).validator((data: { accessToken: string; itemId: string }) => data).handler(async ({ data }) => {
  const user = await resolveUser(data.accessToken);
  const cart = await getOrCreateCart(user.id, data.accessToken);
  await supabaseUserRequest(`cart_items?id=eq.${encodeURIComponent(data.itemId)}&cart_id=eq.${encodeURIComponent(cart.id)}`, data.accessToken, { method: "DELETE" });
  return getCartForUser(user.id, data.accessToken);
});

export const clearServerCart = createServerFn({ method: "POST" }).validator((data: { accessToken: string }) => data).handler(async ({ data }) => {
  const user = await resolveUser(data.accessToken);
  const cart = await getOrCreateCart(user.id, data.accessToken);
  await supabaseUserRequest(`cart_items?cart_id=eq.${encodeURIComponent(cart.id)}`, data.accessToken, { method: "DELETE" });
  return getCartForUser(user.id, data.accessToken);
});
