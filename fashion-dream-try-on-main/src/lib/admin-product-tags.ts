import type { AdminTag } from "@/lib/admin-tags";

function authHeaders() {
  if (typeof window === "undefined") throw new Error("Admin API is browser-only.");
  const raw = window.sessionStorage.getItem("upthink_admin_session");
  if (!raw) throw new Error("Admin session expired. Please sign in again.");
  const session = JSON.parse(raw) as { access_token?: unknown };
  if (typeof session.access_token !== "string" || !session.access_token) {
    throw new Error("Admin session expired. Please sign in again.");
  }
  return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  if (!response.ok) {
    const detail = payload && typeof payload === "object" && "detail" in payload
      ? String((payload as { detail?: unknown }).detail)
      : String(payload || `Request failed (${response.status})`);
    throw new Error(detail);
  }
  return payload as T;
}

type ProductTagsResponse = { product_id: string; tags: AdminTag[] };

export async function getProductTags(productId: string): Promise<AdminTag[]> {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/tags`, { headers: authHeaders() });
  const data = await parseResponse<ProductTagsResponse>(response);
  return data.tags;
}

export async function setProductTags(productId: string, tagIds: string[]): Promise<AdminTag[]> {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/tags`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ tag_ids: [...new Set(tagIds)] }),
  });
  const data = await parseResponse<ProductTagsResponse>(response);
  return data.tags;
}
