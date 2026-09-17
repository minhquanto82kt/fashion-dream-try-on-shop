export type TagStatus = "active" | "archived";

export type AdminTag = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: TagStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  product_count: number;
};

type TagPayload = {
  name: string;
  slug: string;
  description?: string | null;
  status?: TagStatus;
};

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
    const detail = payload && typeof payload === "object" && "detail" in payload ? String((payload as { detail?: unknown }).detail) : String(payload || `Request failed (${response.status})`);
    throw new Error(detail);
  }
  return payload as T;
}

export async function listAdminTags(status?: TagStatus): Promise<AdminTag[]> {
  const query = status ? `?status_filter=${status}` : "";
  const response = await fetch(`/api/admin/tags${query}`, { headers: authHeaders() });
  const data = await parseResponse<{ items: AdminTag[] }>(response);
  return data.items;
}

export async function getAdminTag(id: string): Promise<AdminTag> {
  const response = await fetch(`/api/admin/tags/${encodeURIComponent(id)}`, { headers: authHeaders() });
  return parseResponse<AdminTag>(response);
}

export async function createAdminTag(payload: TagPayload): Promise<AdminTag> {
  const response = await fetch("/api/admin/tags", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
  return parseResponse<AdminTag>(response);
}

export async function updateAdminTag(id: string, payload: Partial<TagPayload>): Promise<AdminTag> {
  const response = await fetch(`/api/admin/tags/${encodeURIComponent(id)}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload) });
  return parseResponse<AdminTag>(response);
}

export async function deleteAdminTag(id: string): Promise<void> {
  const response = await fetch(`/api/admin/tags/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
  await parseResponse<unknown>(response);
}
