import "../admin-theme.css";
import "../wearo-contrast.css";
import "../styles/admin-appearance-fixes.css";
import "./branding";

export type ThemeColors = { primary: string; secondary: string; background: string; surface: string; accent: string; foreground: string };
export type ThemeWorkflowStatus = "draft" | "published";
export type ThemeWorkflowRecord = { id: string; name: string; scope: "global"; status: ThemeWorkflowStatus; theme_data: ThemeColors; created_by: string | null; created_at: string; updated_at: string; published_at: string | null };

export const DEFAULT_THEME_COLORS: ThemeColors = { primary: "#F0A500", secondary: "#E6D5B8", background: "#1B1A17", surface: "#24221E", accent: "#E45826", foreground: "#F7F1E7" };
export const THEME_STORAGE_KEY = "upthink-theme-colors";
const THEME_PREVIEW_STORAGE_KEY = "upthink-theme-preview";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const THEME_ENDPOINT = "/rest/v1/appearance_themes";
const ADMIN_SESSION_KEY = "upthink_admin_session";

type AdminSession = { access_token?: string };
type SupabaseConfig = { url: string; key: string };

function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;
  return url && key ? { url, key } : null;
}

function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    return typeof session.access_token === "string" && session.access_token.length > 0 ? session.access_token : null;
  } catch { return null; }
}

function requireAdminConfig(): { config: SupabaseConfig; token: string } {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase theme configuration is missing.");
  const token = getAdminAccessToken();
  if (!token) throw new Error("Admin session expired. Please sign in again.");
  return { config, token };
}

function authHeaders(config: SupabaseConfig, token: string) { return { apikey: config.key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }; }
export function isValidHexColor(value: string): boolean { return HEX_COLOR.test(value); }

export function sanitizeThemeColors(value: unknown): ThemeColors {
  if (!value || typeof value !== "object") return DEFAULT_THEME_COLORS;
  const candidate = value as Partial<Record<keyof ThemeColors, unknown>>;
  const next = { ...DEFAULT_THEME_COLORS };
  for (const key of Object.keys(DEFAULT_THEME_COLORS) as Array<keyof ThemeColors>) {
    if (typeof candidate[key] === "string" && isValidHexColor(candidate[key])) next[key] = candidate[key] as string;
  }
  return next;
}

function fromWorkflowRow(row: Record<string, unknown>): ThemeWorkflowRecord {
  if (typeof row.id !== "string" || typeof row.name !== "string" || (row.scope !== "global" && row.scope !== undefined) || (row.status !== "draft" && row.status !== "published")) throw new Error("Theme workflow response is invalid.");
  return { id: row.id, name: row.name, scope: "global", status: row.status as ThemeWorkflowStatus, theme_data: sanitizeThemeColors(row.theme_data), created_by: typeof row.created_by === "string" ? row.created_by : null, created_at: typeof row.created_at === "string" ? row.created_at : "", updated_at: typeof row.updated_at === "string" ? row.updated_at : "", published_at: typeof row.published_at === "string" ? row.published_at : null };
}

export function getStoredTheme(): ThemeColors {
  if (typeof window === "undefined") return DEFAULT_THEME_COLORS;
  try { const raw = window.localStorage.getItem(THEME_STORAGE_KEY); return raw ? sanitizeThemeColors(JSON.parse(raw)) : DEFAULT_THEME_COLORS; } catch { return DEFAULT_THEME_COLORS; }
}

export function applyTheme(colors: ThemeColors): void {
  if (typeof document === "undefined") return;
  const theme = sanitizeThemeColors(colors);
  for (const [key, value] of Object.entries(theme)) document.documentElement.style.setProperty(`--theme-${key}`, value);
}

function cacheTheme(theme: ThemeColors): void { if (typeof window !== "undefined") window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme)); }

async function fetchThemeRows(status?: ThemeWorkflowStatus): Promise<ThemeWorkflowRecord[]> {
  const { config, token } = requireAdminConfig();
  const statusQuery = status ? `&status=eq.${status}` : "";
  const response = await fetch(`${config.url}${THEME_ENDPOINT}?scope=eq.global&select=*&order=updated_at.desc${statusQuery}`, { headers: authHeaders(config, token) });
  if (!response.ok) throw new Error(`Theme read failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
  return (await response.json() as Record<string, unknown>[]).map(fromWorkflowRow);
}

export async function loadRemoteTheme(): Promise<ThemeColors | null> {
  const config = getSupabaseConfig();
  if (!config || typeof window === "undefined") return null;
  try {
    const isAdminAppearance = window.location.pathname.startsWith("/admin/appearance");
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get("theme_preview") === "1";
    if (isPreview) {
      const encodedPreview = params.get("theme_data");
      if (encodedPreview) {
        try {
          const preview = sanitizeThemeColors(JSON.parse(encodedPreview));
          cacheTheme(preview); applyTheme(preview);
          window.dispatchEvent(new CustomEvent("upthink:theme:preview", { detail: preview }));
          return preview;
        } catch { /* fall through to session preview */ }
      }
      const preview = window.sessionStorage.getItem(THEME_PREVIEW_STORAGE_KEY);
      if (preview) { const theme = sanitizeThemeColors(JSON.parse(preview)); cacheTheme(theme); applyTheme(theme); window.dispatchEvent(new CustomEvent("upthink:theme:preview", { detail: theme })); return theme; }
    }
    if (isAdminAppearance) {
      const adminToken = getAdminAccessToken();
      if (adminToken) {
        const draftResponse = await fetch(`${config.url}${THEME_ENDPOINT}?scope=eq.global&status=eq.draft&select=theme_data&order=updated_at.desc&limit=1`, { headers: { apikey: config.key, Authorization: `Bearer ${adminToken}` } });
        if (draftResponse.ok) {
          const drafts = await draftResponse.json() as Record<string, unknown>[];
          if (drafts[0]) { const draft = sanitizeThemeColors(drafts[0].theme_data); cacheTheme(draft); applyTheme(draft); window.dispatchEvent(new CustomEvent("upthink:theme:changed", { detail: draft })); return draft; }
        }
      }
    }
    const publishedResponse = await fetch(`${config.url}${THEME_ENDPOINT}?scope=eq.global&status=eq.published&select=theme_data&order=updated_at.desc&limit=1`, { headers: { apikey: config.key } });
    if (!publishedResponse.ok) return null;
    const publishedRows = await publishedResponse.json() as Record<string, unknown>[];
    if (!publishedRows[0]) return null;
    const theme = sanitizeThemeColors(publishedRows[0].theme_data); cacheTheme(theme); applyTheme(theme); window.dispatchEvent(new CustomEvent("upthink:theme:changed", { detail: theme })); return theme;
  } catch { return null; }
}

export async function getThemeWorkflow(): Promise<{ published: ThemeWorkflowRecord | null; draft: ThemeWorkflowRecord | null }> {
  const [publishedRows, draftRows] = await Promise.all([fetchThemeRows("published"), fetchThemeRows("draft")]);
  return { published: publishedRows[0] ?? null, draft: draftRows[0] ?? null };
}

export async function saveThemeToDatabase(colors: ThemeColors, name = "WEARO 2026 Draft"): Promise<ThemeColors> {
  const theme = sanitizeThemeColors(colors);
  const { config, token } = requireAdminConfig();
  const headers = authHeaders(config, token);
  const existingResponse = await fetch(`${config.url}${THEME_ENDPOINT}?scope=eq.global&status=eq.draft&select=id&order=updated_at.desc&limit=1`, { headers });
  if (!existingResponse.ok) throw new Error(`Theme draft read failed (${existingResponse.status}).`);
  const existingRows = await existingResponse.json() as Array<{ id?: unknown }>;
  const existingId = typeof existingRows[0]?.id === "string" ? existingRows[0].id : null;
  const payload = { name: name.trim() || "WEARO 2026 Draft", scope: "global", status: "draft", theme_data: theme, updated_at: new Date().toISOString() };
  const response = await fetch(existingId ? `${config.url}${THEME_ENDPOINT}?id=eq.${encodeURIComponent(existingId)}` : `${config.url}${THEME_ENDPOINT}`, { method: existingId ? "PATCH" : "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Theme draft save failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
  cacheTheme(theme); applyTheme(theme); window.dispatchEvent(new CustomEvent("upthink:theme:draft-saved", { detail: theme })); return theme;
}

export async function publishTheme(): Promise<ThemeColors> {
  const { config, token } = requireAdminConfig();
  const draftResponse = await fetch(`${config.url}${THEME_ENDPOINT}?scope=eq.global&status=eq.draft&select=id&order=updated_at.desc&limit=1`, { headers: authHeaders(config, token) });
  if (!draftResponse.ok) throw new Error(`Theme draft read failed (${draftResponse.status}).`);
  const drafts = await draftResponse.json() as Array<{ id?: unknown }>;
  const draftId = typeof drafts[0]?.id === "string" ? drafts[0].id : null;
  if (!draftId) throw new Error("There is no saved draft to publish.");
  const response = await fetch(`${config.url}/rest/v1/rpc/publish_appearance_theme`, { method: "POST", headers: { ...authHeaders(config, token), Prefer: "return=representation" }, body: JSON.stringify({ p_draft_id: draftId }) });
  if (!response.ok) throw new Error(`Theme publish failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
  const row = await response.json() as Record<string, unknown> | Record<string, unknown>[];
  const publishedRow = Array.isArray(row) ? row[0] : row;
  const theme = sanitizeThemeColors(publishedRow?.theme_data);
  cacheTheme(theme); applyTheme(theme); window.dispatchEvent(new CustomEvent("upthink:theme:published", { detail: theme })); return theme;
}

export async function discardThemeDraft(): Promise<void> {
  const { config, token } = requireAdminConfig();
  const response = await fetch(`${config.url}${THEME_ENDPOINT}?scope=eq.global&status=eq.draft`, { method: "DELETE", headers: authHeaders(config, token) });
  if (!response.ok) throw new Error(`Theme draft discard failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
  const publishedResponse = await fetch(`${config.url}${THEME_ENDPOINT}?scope=eq.global&status=eq.published&select=theme_data&order=updated_at.desc&limit=1`, { headers: { apikey: config.key } });
  if (publishedResponse.ok) {
    const rows = await publishedResponse.json() as Record<string, unknown>[];
    if (rows[0]) { const theme = sanitizeThemeColors(rows[0].theme_data); cacheTheme(theme); applyTheme(theme); window.dispatchEvent(new CustomEvent("upthink:theme:discarded", { detail: theme })); }
  }
}

export async function resetTheme(): Promise<ThemeColors> { return saveThemeToDatabase(DEFAULT_THEME_COLORS, "WEARO 2026 Draft"); }

export async function openThemePreview(colors?: ThemeColors): Promise<void> {
  const preview = sanitizeThemeColors(colors ?? getStoredTheme());
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(THEME_PREVIEW_STORAGE_KEY, JSON.stringify(preview));
  const params = new URLSearchParams({ theme_preview: "1", theme_data: JSON.stringify(preview) });
  window.open(`/?${params.toString()}`, "_blank", "noopener,noreferrer");
}

if (typeof window !== "undefined") applyTheme(getStoredTheme());
