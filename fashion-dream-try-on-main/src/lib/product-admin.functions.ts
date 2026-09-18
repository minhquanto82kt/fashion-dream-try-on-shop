import { createServerFn } from "@tanstack/react-start";
import { supabaseRequest } from "./supabase.server";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  long_description: string | null;
  price: number;
  category: string;
  image: string | null;
  active: boolean;
  status: "draft" | "published" | "archived";
  featured: boolean;
  created_at: string;
  updated_at: string;
};

type AdminContext = { accessToken: string };

function getServerConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Thiếu cấu hình Supabase trên server.");
  return { url, secretKey };
}

async function requireAdmin(accessToken: string) {
  const token = accessToken.trim();
  if (!token) throw new Error("UNAUTHORIZED");

  const { url, secretKey } = getServerConfig();
  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: secretKey, Authorization: `Bearer ${token}` },
  });
  if (!userResponse.ok) throw new Error("UNAUTHORIZED");

  const user = (await userResponse.json()) as { id?: string };
  if (!user.id) throw new Error("UNAUTHORIZED");

  const admins = await supabaseRequest<Array<{ user_id: string }>>(
    `admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
    { method: "GET" },
  );
  if (!admins.length) throw new Error("FORBIDDEN");

  return user.id;
}

export const listAdminProducts = createServerFn({ method: "POST" })
  .validator((data: AdminContext) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    return supabaseRequest<AdminProduct[]>(
      "products?select=*&order=created_at.desc",
      { method: "GET" },
    );
  });

export const getAdminProduct = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const rows = await supabaseRequest<AdminProduct[]>(
      `products?select=*&id=eq.${encodeURIComponent(data.id)}&limit=1`,
      { method: "GET" },
    );
    return rows[0] ?? null;
  });

export const createAdminProduct = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { product: { name: string; slug: string; price: number; category: string; description?: string | null; short_description?: string | null; long_description?: string | null; image?: string | null; active?: boolean; status?: AdminProduct["status"]; featured?: boolean } }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const name = data.product.name.trim();
    const slug = data.product.slug.trim();
    const price = Number(data.product.price);
    if (!name || !slug) throw new Error("Tên sản phẩm và slug là bắt buộc.");
    if (!Number.isFinite(price) || price < 0) throw new Error("Giá sản phẩm không hợp lệ.");

    const randomId = crypto.randomUUID();
    const rows = await supabaseRequest<AdminProduct[]>(
      "products",
      {
        method: "POST",
        body: JSON.stringify({
          ...data.product,
          name,
          slug,
          price,
          id: `product-${randomId}`,
          active: data.product.status === "published",
        }),
      },
    );
    return rows[0];
  });

export const updateAdminProduct = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { id: string; product: Partial<Omit<AdminProduct, "id" | "created_at" | "updated_at">> }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const patch = { ...data.product };
    if (patch.name !== undefined) patch.name = patch.name.trim();
    if (patch.slug !== undefined) patch.slug = patch.slug.trim();
    if (patch.price !== undefined && (!Number.isFinite(Number(patch.price)) || Number(patch.price) < 0)) {
      throw new Error("Giá sản phẩm không hợp lệ.");
    }
    if (patch.status !== undefined) patch.active = patch.status === "published";

    const rows = await supabaseRequest<AdminProduct[]>(
      `products?id=eq.${encodeURIComponent(data.id)}`,
      { method: "PATCH", body: JSON.stringify(patch) },
    );
    return rows[0];
  });

export const archiveAdminProduct = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const rows = await supabaseRequest<AdminProduct[]>(
      `products?id=eq.${encodeURIComponent(data.id)}`,
      { method: "PATCH", body: JSON.stringify({ status: "archived", active: false }) },
    );
    return rows[0];
  });
