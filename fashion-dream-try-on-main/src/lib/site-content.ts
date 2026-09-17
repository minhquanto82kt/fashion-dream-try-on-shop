export type SiteContentSettings = {
  id: "global";
  announcement_enabled: boolean;
  announcement_text: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_cta_label: string;
  hero_cta_url: string;
  social_title: string;
  social_description: string;
  favicon_url: string | null;
  social_image_url: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const ENDPOINT = "/rest/v1/site_content_settings";
const SESSION_KEY = "upthink_admin_session";

function config(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;
  return url && key ? { url, key } : null;
}

function token(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) as { access_token?: string } : null;
    return typeof session?.access_token === "string" ? session.access_token : null;
  } catch { return null; }
}

export async function readSiteContent(): Promise<SiteContentSettings | null> {
  const c = config(); if (!c) return null;
  const response = await fetch(`${c.url}${ENDPOINT}?id=eq.global&select=*&limit=1`, { headers: { apikey: c.key } });
  if (!response.ok) throw new Error(`Unable to read site content (${response.status}).`);
  const rows = await response.json() as SiteContentSettings[];
  return rows[0] ?? null;
}

export async function updateSiteContent(input: Omit<SiteContentSettings, "id" | "updated_by" | "created_at" | "updated_at">): Promise<SiteContentSettings> {
  const c = config(); const accessToken = token();
  if (!c) throw new Error("Supabase configuration is missing.");
  if (!accessToken) throw new Error("Admin session expired. Please sign in again.");
  const response = await fetch(`${c.url}${ENDPOINT}?id=eq.global`, {
    method: "PATCH",
    headers: { apikey: c.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ ...input, updated_by: null }),
  });
  if (!response.ok) { const detail = await response.text(); throw new Error(`Unable to save site content (${response.status}). ${detail.slice(0, 180)}`); }
  const rows = await response.json() as SiteContentSettings[];
  if (!rows[0]) throw new Error("Site content was not returned after saving.");
  return rows[0];
}
