import { createServerFn } from "@tanstack/react-start";
import { supabaseUserRequest, type SupabaseUserClient } from "./supabase.user.server";

type CartRow = { id: string; user_id: string; created_at: string; updated_at: string };
type CartItemRow = { id: string; cart_id: string; variant_id: string; quantity: number; created_at: string; updated_at: string };
type VariantRow = { id: string; product_id: string; size: string; color: string; sku: string | null; stock: number };

async function getOrCreateCart(client: SupabaseUserClient, userId: string): Promise<CartRow> {
  const existing = await client.request<CartRow[]>(
    `carts?user_id=eq.${encodeURIComponent(userId)}&select=id,user_id,created_at,updated_at&limit=1`,
  );
  if (existing[0]) return existing[0];
  const created = await client.request<CartRow[]>("carts", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  if (!created[0]) throw new Error("Không thể tạo giỏ hàng.");
  return created[0];
}

async function getCartForUser(client: SupabaseUserClient, userId: string) {
  const cart = await getOrCreateCart(client, userId);
  const items = await client.request<CartItemRow[]>(
    `cart_items?cart_id=eq.${encodeURIComponent(cart.id)}&select=id,cart_id,variant_id,quantity,created_at,updated_at&order=created_at.asc`,
  );
  if (!items.length) return { cart, items: [] as Array<CartItemRow & { variant: VariantRow | null }> };

  const variantIds = [...new Set(items.map((item) => item.variant_id))];
  const variants = await client.request<VariantRow[]>(
    `product_variants?id=in.(${variantIds.map(encodeURIComponent).join(",")})&select=id,product_id,size,color,sku,stock`,
  );
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  return {
    cart,
    items: items.map((item) => ({ ...item, variant: variantMap.get(item.variant_id) ?? null })),
  };
}

export const getServerCart = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => data)
  .handler(async ({ data }) => supabaseUserRequest(data.accessToken, (client, userId) => getCartForUser(client, userId)));

export const addServerCartItem = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; variantId: string; quantity: number }) => data)
  .handler(async ({ data }) => {
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 99) throw new Error("Số lượng không hợp lệ.");
    return supabaseUserRequest(data.accessToken, async (client, userId) => {
      const cart = await getOrCreateCart(client, userId);
      const variants = await client.request<VariantRow[]>(
        `product_variants?id=eq.${encodeURIComponent(data.variantId)}&select=id,product_id,size,color,sku,stock&limit=1`,
      );
      const variant = variants[0];
      if (!variant) throw new Error("Không tìm thấy biến thể sản phẩm.");
      if (variant.stock < data.quantity) throw new Error(`Chỉ còn ${variant.stock} sản phẩm trong kho.`);

      const existing = await client.request<CartItemRow[]>(
        `cart_items?cart_id=eq.${encodeURIComponent(cart.id)}&variant_id=eq.${encodeURIComponent(data.variantId)}&select=id,cart_id,variant_id,quantity,created_at,updated_at&limit=1`,
      );
      const nextQuantity = (existing[0]?.quantity ?? 0) + data.quantity;
      if (nextQuantity > 99 || nextQuantity > variant.stock) throw new Error("Số lượng vượt quá tồn kho.");

      if (existing[0]) {
        await client.request(`cart_items?id=eq.${encodeURIComponent(existing[0].id)}&cart_id=eq.${encodeURIComponent(cart.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: nextQuantity, updated_at: new Date().toISOString() }),
        });
      } else {
        await client.request("cart_items", {
          method: "POST",
          body: JSON.stringify({ cart_id: cart.id, variant_id: data.variantId, quantity: data.quantity }),
        });
      }
      return getCartForUser(client, userId);
    });
  });

export const updateServerCartItem = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; itemId: string; quantity: number }) => data)
  .handler(async ({ data }) => {
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 99) throw new Error("Số lượng không hợp lệ.");
    return supabaseUserRequest(data.accessToken, async (client, userId) => {
      const cart = await getOrCreateCart(client, userId);
      const items = await client.request<CartItemRow[]>(
        `cart_items?id=eq.${encodeURIComponent(data.itemId)}&cart_id=eq.${encodeURIComponent(cart.id)}&select=id,cart_id,variant_id,quantity,created_at,updated_at&limit=1`,
      );
      if (!items[0]) throw new Error("Sản phẩm không thuộc giỏ hàng của bạn.");
      const variants = await client.request<VariantRow[]>(
        `product_variants?id=eq.${encodeURIComponent(items[0].variant_id)}&select=id,product_id,size,color,sku,stock&limit=1`,
      );
      if (!variants[0]) throw new Error("Biến thể sản phẩm không còn tồn tại.");
      if (data.quantity > variants[0].stock) throw new Error(`Chỉ còn ${variants[0].stock} sản phẩm trong kho.`);
      await client.request(`cart_items?id=eq.${encodeURIComponent(data.itemId)}&cart_id=eq.${encodeURIComponent(cart.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: data.quantity, updated_at: new Date().toISOString() }),
      });
      return getCartForUser(client, userId);
    });
  });

export const removeServerCartItem = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; itemId: string }) => data)
  .handler(async ({ data }) => supabaseUserRequest(data.accessToken, async (client, userId) => {
    const cart = await getOrCreateCart(client, userId);
    await client.request(`cart_items?id=eq.${encodeURIComponent(data.itemId)}&cart_id=eq.${encodeURIComponent(cart.id)}`, { method: "DELETE" });
    return getCartForUser(client, userId);
  }));

export const clearServerCart = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => data)
  .handler(async ({ data }) => supabaseUserRequest(data.accessToken, async (client, userId) => {
    const cart = await getOrCreateCart(client, userId);
    await client.request(`cart_items?cart_id=eq.${encodeURIComponent(cart.id)}`, { method: "DELETE" });
    return getCartForUser(client, userId);
  }));
