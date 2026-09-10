/**
 * UpThink Supabase helpers
 *
 * Browser-safe REST client for the Product Admin page.
 * Required Vercel Preview environment variables:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * IMPORTANT:
 * Never put a Supabase secret/service_role key in frontend code.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() as string | undefined;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() as string | undefined;

if (!SUPABASE_URL) {
  throw new Error(
    "Missing VITE_SUPABASE_URL. Add it to the Vercel Preview environment variables."
  );
}

if (!SUPABASE_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY. Add it to the Vercel Preview environment variables."
  );
}

export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,
};

export type Session = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: { id: string; email?: string };
};

const SESSION_KEY = "upthink_admin_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.sessionStorage.removeItem(SESSION_KEY);
  } else {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

function headers(extra?: Record<string, string>) {
  const session = getSession();

  return {
    apikey: supabaseConfig.key,
    Authorization: `Bearer ${session?.access_token ?? supabaseConfig.key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    let message = text || `Request failed (${response.status})`;

    try {
      const json = JSON.parse(text);
      message =
        json.message ||
        json.error_description ||
        json.error ||
        json.hint ||
        message;
    } catch {
      // Keep the original response text.
    }

    throw new Error(message);
  }

  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export async function signIn(email: string, password: string) {
  const response = await fetch(
    `${supabaseConfig.url}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: supabaseConfig.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await parseResponse<Session>(response);
  setSession(data);
  return data;
}

export async function signOut() {
  const session = getSession();

  // Best-effort server logout. Clear the local session even if the request fails.
  if (session?.access_token) {
    try {
      await fetch(`${supabaseConfig.url}/auth/v1/logout`, {
        method: "POST",
        headers: headers(),
      });
    } catch {
      // Ignore logout network errors.
    }
  }

  setSession(null);
}

export async function getUser() {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    headers: headers(),
  });

  return parseResponse<{ id: string; email?: string }>(response);
}

export async function checkAdmin() {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({}),
  });

  return parseResponse<boolean>(response);
}

export type Product = {
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

export type ProductImage = {
  id?: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string | null;
  stock: number;
  created_at: string;
};

export async function listProductVariants(productId: string) {
  const url =
    `${supabaseConfig.url}/rest/v1/product_variants` +
    `?select=*` +
    `&product_id=eq.${encodeURIComponent(productId)}` +
    `&order=size.asc,color.asc`;

  const response = await fetch(url, {
    headers: headers(),
  });

  return parseResponse<ProductVariant[]>(response);
}

export async function createProductVariant(
  payload: {
    product_id: string;
    size: string;
    color: string;
    sku?: string | null;
    stock?: number;
  }
) {
  const response = await fetch(
    `${supabaseConfig.url}/rest/v1/product_variants`,
    {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        product_id: payload.product_id,
        size: payload.size.trim(),
        color: payload.color.trim(),
        sku: payload.sku?.trim() || null,
        stock: payload.stock ?? 0,
      }),
    }
  );

  const data = await parseResponse<ProductVariant[]>(response);
  return data[0];
}

export async function updateProductVariant(
  id: string,
  payload: {
    size?: string;
    color?: string;
    sku?: string | null;
    stock?: number;
  }
) {
  const response = await fetch(
    `${supabaseConfig.url}/rest/v1/product_variants?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...headers(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...(payload.size !== undefined
          ? { size: payload.size.trim() }
          : {}),
        ...(payload.color !== undefined
          ? { color: payload.color.trim() }
          : {}),
        ...(payload.sku !== undefined
          ? { sku: payload.sku?.trim() || null }
          : {}),
        ...(payload.stock !== undefined
          ? { stock: payload.stock }
          : {}),
      }),
    }
  );

  const data = await parseResponse<ProductVariant[]>(response);
  return data[0];
}

export async function deleteProductVariant(id: string) {
  const response = await fetch(
    `${supabaseConfig.url}/rest/v1/product_variants?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: headers(),
    }
  );

  await parseResponse<unknown>(response);
}

export async function getProduct(id: string) {
  const url =
    `${supabaseConfig.url}/rest/v1/products` +
    `?select=*` +
    `&id=eq.${encodeURIComponent(id)}` +
    `&limit=1`;

  const response = await fetch(url, {
    headers: headers(),
  });

  const data = await parseResponse<Product[]>(response);
  return data[0] ?? null;
}

export async function listProducts() {
  const url =
    `${supabaseConfig.url}/rest/v1/products` +
    `?select=*&order=created_at.desc`;

  const response = await fetch(url, {
    headers: headers(),
  });

  return parseResponse<Product[]>(response);
}

export async function createProduct(
  payload: Partial<Product> & {
    name: string;
    slug: string;
    price: number;
    category: string;
  }
) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const id = `product-${randomId}`;

  const response = await fetch(`${supabaseConfig.url}/rest/v1/products`, {
    method: "POST",
    headers: {
      ...headers(),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...payload,
      id,
    }),
  });

  const data = await parseResponse<Product[]>(response);
  return data[0];
}

export async function updateProduct(
  id: string,
  payload: Partial<Product>
) {
  const response = await fetch(
    `${supabaseConfig.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...headers(),
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await parseResponse<Product[]>(response);
  return data[0];
}

export async function deleteProduct(id: string) {
  const response = await fetch(
    `${supabaseConfig.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: headers(),
    }
  );

  await parseResponse<unknown>(response);
}

export async function uploadProductImage(productId: string, file: File) {
  const extension =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";

  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const safeName = `${Date.now()}-${randomId}.${extension}`;
  const path = `${productId}/${safeName}`;

  const response = await fetch(
    `${supabaseConfig.url}/storage/v1/object/product-images/${path}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseConfig.key,
        Authorization: `Bearer ${getSession()?.access_token ?? ""}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: file,
    }
  );

  await parseResponse<unknown>(response);

  return `${supabaseConfig.url}/storage/v1/object/public/product-images/${path}`;
}

export async function addProductImage(
  productId: string,
  imageUrl: string,
  isPrimary: boolean
) {
  const response = await fetch(
    `${supabaseConfig.url}/rest/v1/product_images`,
    {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        product_id: productId,
        image_url: imageUrl,
        sort_order: 0,
        is_primary: isPrimary,
      }),
    }
  );

  const data = await parseResponse<ProductImage[]>(response);
  return data[0];
}
