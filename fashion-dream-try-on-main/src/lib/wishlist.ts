import { getCustomerSession } from "@/lib/auth";
import { supabaseConfig } from "@/lib/upthink-supabase";

const PREVIEW_KEY = "wearo-preview-wishlist";

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

function isPreviewUser(userId?: string | null) {
  return userId === "preview-account-user";
}

function readPreviewIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(PREVIEW_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writePreviewIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREVIEW_KEY, JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new CustomEvent("wearo:wishlist:changed"));
}

function customerHeaders() {
  const session = getCustomerSession();
  return {
    apikey: supabaseConfig.key,
    Authorization: `Bearer ${session?.access_token ?? supabaseConfig.key}`,
    "Content-Type": "application/json",
  };
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    let message = text || `Wishlist request failed (${response.status})`;
    try {
      const body = JSON.parse(text) as { message?: string; details?: string; hint?: string };
      message = body.message || body.details || body.hint || message;
    } catch {}
    throw new Error(message);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function listWishlistProductIds(userId?: string | null): Promise<string[]> {
  const session = getCustomerSession();
  const id = userId ?? session?.user?.id;
  if (!id) return [];
  if (isPreviewUser(id)) return readPreviewIds();

  const url = `${supabaseConfig.url}/rest/v1/wishlist_items?select=product_id&user_id=eq.${encodeURIComponent(id)}&order=created_at.desc`;
  const response = await fetch(url, { headers: customerHeaders() });
  const rows = await parse<Array<{ product_id: string }>>(response);
  return rows.map((row) => row.product_id);
}

export async function isWishlisted(productId: string, userId?: string | null) {
  const ids = await listWishlistProductIds(userId);
  return ids.includes(productId);
}

export async function addToWishlist(productId: string, userId?: string | null) {
  const session = getCustomerSession();
  const id = userId ?? session?.user?.id;
  if (!id) throw new Error("Vui lòng đăng nhập để lưu sản phẩm yêu thích.");
  if (isPreviewUser(id)) {
    writePreviewIds([...readPreviewIds(), productId]);
    return;
  }

  const response = await fetch(`${supabaseConfig.url}/rest/v1/wishlist_items`, {
    method: "POST",
    headers: { ...customerHeaders(), Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({ user_id: id, product_id: productId }),
  });
  await parse<WishlistItem[]>(response);
  window.dispatchEvent(new CustomEvent("wearo:wishlist:changed"));
}

export async function removeFromWishlist(productId: string, userId?: string | null) {
  const session = getCustomerSession();
  const id = userId ?? session?.user?.id;
  if (!id) return;
  if (isPreviewUser(id)) {
    writePreviewIds(readPreviewIds().filter((value) => value !== productId));
    return;
  }

  const url = `${supabaseConfig.url}/rest/v1/wishlist_items?user_id=eq.${encodeURIComponent(id)}&product_id=eq.${encodeURIComponent(productId)}`;
  const response = await fetch(url, { method: "DELETE", headers: customerHeaders() });
  await parse<unknown>(response);
  window.dispatchEvent(new CustomEvent("wearo:wishlist:changed"));
}

export async function toggleWishlist(productId: string, userId?: string | null) {
  const current = await isWishlisted(productId, userId);
  if (current) {
    await removeFromWishlist(productId, userId);
    return false;
  }
  await addToWishlist(productId, userId);
  return true;
}
