export type SiteContentFields = {
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
};

export type SiteContentSettings = SiteContentFields & {
  id: "global";
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  draft_content: SiteContentFields | null;
  published_content: SiteContentFields | null;
};

const ENDPOINT = "/rest/v1/site_content_settings";
const RPC_PUBLISH = "/rest/v1/rpc/publish_site_content";
const RPC_DISCARD = "/rest/v1/rpc/discard_site_content_draft";
const SESSION_KEY = "upthink_admin_session";

type SupabaseConfig = { url: string; key: string };

function config(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;
  return url && key ? { url, key } : null;
}

function token(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) as { access_token?: string } : null;
    return typeof session?.access_token === "string" && session.access_token ? session.access_token : null;
  } catch { return null; }
}

function authHeaders(c: SupabaseConfig, accessToken: string) {
  return { apikey: c.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

function normalizeFields(value: unknown): SiteContentFields {
  const source = (value && typeof value === "object" ? value : {}) as Partial<SiteContentFields>;
  return {
    announcement_enabled: Boolean(source.announcement_enabled),
    announcement_text: typeof source.announcement_text === "string" ? source.announcement_text : "",
    hero_eyebrow: typeof source.hero_eyebrow === "string" ? source.hero_eyebrow : "",
    hero_title: typeof source.hero_title === "string" ? source.hero_title : "",
    hero_description: typeof source.hero_description === "string" ? source.hero_description : "",
    hero_cta_label: typeof source.hero_cta_label === "string" ? source.hero_cta_label : "",
    hero_cta_url: typeof source.hero_cta_url === "string" ? source.hero_cta_url : "/shop",
    social_title: typeof source.social_title === "string" ? source.social_title : "",
    social_description: typeof source.social_description === "string" ? source.social_description : "",
    favicon_url: typeof source.favicon_url === "string" ? source.favicon_url : null,
    social_image_url: typeof source.social_image_url === "string" ? source.social_image_url : null,
  };
}

function mapRow(row: Record<string, unknown>): SiteContentSettings {
  if (row.id !== "global") throw new Error("Invalid site content record.");
  return {
    id: "global",
    ...normalizeFields(row),
    updated_by: typeof row.updated_by === "string" ? row.updated_by : null,
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
    draft_content: row.draft_content ? normalizeFields(row.draft_content) : null,
    published_content: row.published_content ? normalizeFields(row.published_content) : null,
  };
}

async function readRow(publicOnly: boolean): Promise<SiteContentSettings | null> {
  const c = config();
  if (!c) return null;
  const accessToken = token();
  const headers = accessToken && !publicOnly ? authHeaders(c, accessToken) : { apikey: c.key };
  const response = await fetch(`${c.url}${ENDPOINT}?id=eq.global&select=*&limit=1`, { headers });
  if (!response.ok) throw new Error(`Unable to read site content (${response.status}).`);
  const rows = await response.json() as Record<string, unknown>[];
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function readSiteContent(): Promise<SiteContentSettings | null> {
  const row = await readRow(false);
  if (!row) return null;
  return { ...row, ...normalizeFields(row.draft_content ?? row) };
}

export async function readPublishedSiteContent(): Promise<SiteContentFields | null> {
  const row = await readRow(true);
  if (!row) return null;
  return row.published_content ?? normalizeFields(row);
}

export async function updateSiteContent(input: SiteContentFields): Promise<SiteContentSettings> {
  const c = config(); const accessToken = token();
  if (!c) throw new Error("Supabase configuration is missing.");
  if (!accessToken) throw new Error("Admin session expired. Please sign in again.");
  const response = await fetch(`${c.url}${ENDPOINT}?id=eq.global`, {
    method: "PATCH",
    headers: { ...authHeaders(c, accessToken), Prefer: "return=representation" },
    body: JSON.stringify({ draft_content: input, updated_by: null, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) { const detail = await response.text(); throw new Error(`Unable to save content draft (${response.status}). ${detail.slice(0, 180)}`); }
  const rows = await response.json() as Record<string, unknown>[];
  if (!rows[0]) throw new Error("Content draft was not returned after saving.");
  return mapRow(rows[0]);
}

export async function publishSiteContent(): Promise<SiteContentSettings> {
  const c = config(); const accessToken = token();
  if (!c || !accessToken) throw new Error("Admin session expired. Please sign in again.");
  const response = await fetch(`${c.url}${RPC_PUBLISH}`, { method: "POST", headers: authHeaders(c, accessToken), body: "{}" });
  if (!response.ok) { const detail = await response.text(); throw new Error(`Unable to publish content (${response.status}). ${detail.slice(0, 180)}`); }
  return mapRow(await response.json() as Record<string, unknown>);
}

export async function discardSiteContentDraft(): Promise<SiteContentSettings> {
  const c = config(); const accessToken = token();
  if (!c || !accessToken) throw new Error("Admin session expired. Please sign in again.");
  const response = await fetch(`${c.url}${RPC_DISCARD}`, { method: "POST", headers: authHeaders(c, accessToken), body: "{}" });
  if (!response.ok) { const detail = await response.text(); throw new Error(`Unable to discard content draft (${response.status}). ${detail.slice(0, 180)}`); }
  return mapRow(await response.json() as Record<string, unknown>);
}
