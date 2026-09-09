const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "[UpThink Admin] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY."
  );
}

export const supabaseConfig = {
  url: SUPABASE_URL ?? "",
  key: SUPABASE_KEY ?? "",
};

type Session = {
  access_token: string;
  refresh_token?: string;
  user?: { id: string; email?: string };
};

const SESSION_KEY = "upthink_admin_session";

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (!session) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
      message = json.message || json.error_description || json.hint || message;
    } catch {}
    throw new Error(message);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
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

export function signOut() {
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

export async function listProducts() {
  const url =
    `${supabaseConfig.url}/rest/v1/products` +
    `?select=*&order=created_at.desc`;
  const response = await fetch(url, { headers: headers() });
  return parseResponse<Product[]>(response);
}

export async function createProduct(payload: Partial<Product> & { id: string; name: string; slug: string; price: number; category: string }) {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/products`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<Product[]>(response);
  return data[0];
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const response = await fetch(
    `${supabaseConfig.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...headers(), Prefer: "return=representation" },
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
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
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

export async function addProductImage(productId: string, imageUrl: string, isPrimary: boolean) {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/product_images`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({
      product_id: productId,
      image_url: imageUrl,
      sort_order: 0,
      is_primary: isPrimary,
    }),
  });
  const data = await parseResponse<ProductImage[]>(response);
  return data[0];
}
