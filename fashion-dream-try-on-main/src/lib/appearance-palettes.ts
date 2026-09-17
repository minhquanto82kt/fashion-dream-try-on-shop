import { isValidHexColor, type ThemeColors } from "@/lib/theme";

export type AppearancePalette = ThemeColors & {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const ENDPOINT = "/rest/v1/appearance_palettes";

type SupabaseConfig = { url: string; key: string };

function getConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;
  return url && key ? { url, key } : null;
}

function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("upthink_admin_session");
    if (!raw) return null;
    const session = JSON.parse(raw) as { access_token?: unknown };
    return typeof session.access_token === "string" && session.access_token ? session.access_token : null;
  } catch {
    return null;
  }
}

function authHeaders(config: SupabaseConfig, token: string) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function normalizePalette(value: unknown): ThemeColors {
  const candidate = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const keys: Array<keyof ThemeColors> = ["primary", "secondary", "background", "surface", "accent", "foreground"];
  const result = {} as ThemeColors;
  for (const key of keys) {
    const color = candidate[key];
    if (typeof color !== "string" || !isValidHexColor(color)) throw new Error(`Invalid ${key} color.`);
    result[key] = color.toUpperCase();
  }
  return result;
}

function normalizeName(name: string): string {
  const value = name.trim().replace(/\s+/g, " ");
  if (!value) throw new Error("Palette name is required.");
  if (value.length > 80) throw new Error("Palette name must be 80 characters or fewer.");
  return value;
}

function requireAccess(): { config: SupabaseConfig; token: string } {
  const config = getConfig();
  if (!config) throw new Error("Supabase palette configuration is missing.");
  const token = getAdminAccessToken();
  if (!token) throw new Error("Admin session expired. Please sign in again.");
  return { config, token };
}

function mapRow(row: Record<string, unknown>): AppearancePalette {
  const colors = normalizePalette(row);
  if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.created_by !== "string" || typeof row.created_at !== "string" || typeof row.updated_at !== "string") {
    throw new Error("Palette response is invalid.");
  }
  return { id: row.id, name: row.name, created_by: row.created_by, created_at: row.created_at, updated_at: row.updated_at, ...colors };
}

export async function listAppearancePalettes(): Promise<AppearancePalette[]> {
  const { config, token } = requireAccess();
  const response = await fetch(`${config.url}${ENDPOINT}?select=*&order=created_at.desc`, { headers: authHeaders(config, token) });
  if (!response.ok) throw new Error(`Palette read failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
  const rows = await response.json() as Record<string, unknown>[];
  return rows.map(mapRow);
}

export async function createAppearancePalette(name: string, colors: ThemeColors): Promise<AppearancePalette> {
  const { config, token } = requireAccess();
  const payload = { name: normalizeName(name), ...normalizePalette(colors) };
  const response = await fetch(`${config.url}${ENDPOINT}`, {
    method: "POST",
    headers: { ...authHeaders(config, token), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Palette create failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
  const rows = await response.json() as Record<string, unknown>[];
  if (!rows[0]) throw new Error("Palette create returned no record.");
  return mapRow(rows[0]);
}

export async function updateAppearancePalette(id: string, name: string, colors: ThemeColors): Promise<AppearancePalette> {
  const { config, token } = requireAccess();
  const payload = { name: normalizeName(name), ...normalizePalette(colors), updated_at: new Date().toISOString() };
  const response = await fetch(`${config.url}${ENDPOINT}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...authHeaders(config, token), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Palette update failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
  const rows = await response.json() as Record<string, unknown>[];
  if (!rows[0]) throw new Error("Palette update returned no record.");
  return mapRow(rows[0]);
}

export async function deleteAppearancePalette(id: string): Promise<void> {
  const { config, token } = requireAccess();
  const response = await fetch(`${config.url}${ENDPOINT}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(config, token),
  });
  if (!response.ok) throw new Error(`Palette delete failed (${response.status}). ${((await response.text()) || "").slice(0, 180)}`);
}
