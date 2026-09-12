import "../admin-theme.css";

export type ThemeColors = { primary: string; secondary: string; background: string; surface: string; accent: string; foreground: string };

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: "#2E2910",
  secondary: "#2C5745",
  background: "#0B0909",
  surface: "#2E2910",
  accent: "#EB7D00",
  foreground: "#EBE3A7",
};

export const THEME_STORAGE_KEY = "upthink-theme-colors";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const THEME_ENDPOINT = "/rest/v1/site_theme_settings";

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;
  return url && key ? { url, key } : null;
}

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

function fromDatabaseRow(row: Record<string, unknown>): ThemeColors {
  return sanitizeThemeColors({
    primary: row.primary_color,
    secondary: row.secondary_color,
    background: row.background_color,
    surface: row.surface_color,
    accent: row.accent_color,
    foreground: row.foreground_color,
  });
}

export function getStoredTheme(): ThemeColors {
  if (typeof window === "undefined") return DEFAULT_THEME_COLORS;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw ? sanitizeThemeColors(JSON.parse(raw)) : DEFAULT_THEME_COLORS;
  } catch {
    return DEFAULT_THEME_COLORS;
  }
}

export function applyTheme(colors: ThemeColors): void {
  if (typeof document === "undefined") return;
  const theme = sanitizeThemeColors(colors);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) root.style.setProperty(`--theme-${key}`, value);
}

function cacheTheme(theme: ThemeColors): void {
  if (typeof window !== "undefined") window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
}

export async function loadRemoteTheme(): Promise<ThemeColors | null> {
  const config = getSupabaseConfig();
  if (!config || typeof window === "undefined") return null;
  try {
    const response = await fetch(`${config.url}${THEME_ENDPOINT}?id=eq.global&select=primary_color,secondary_color,background_color,surface_color,accent_color,foreground_color`, {
      headers: { apikey: config.key },
    });
    if (!response.ok) return null;
    const rows = await response.json() as Record<string, unknown>[];
    if (!rows[0]) return null;
    const theme = fromDatabaseRow(rows[0]);
    cacheTheme(theme);
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent("upthink:theme:changed", { detail: theme }));
    return theme;
  } catch {
    return null;
  }
}

export async function saveThemeToDatabase(colors: ThemeColors): Promise<ThemeColors> {
  const theme = sanitizeThemeColors(colors);
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase theme configuration is missing.");

  const response = await fetch(`${config.url}${THEME_ENDPOINT}?id=eq.global`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      primary_color: theme.primary,
      secondary_color: theme.secondary,
      background_color: theme.background,
      surface_color: theme.surface,
      accent_color: theme.accent,
      foreground_color: theme.foreground,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Theme save failed (${response.status}). ${detail.slice(0, 180)}`);
  }
  const rows = await response.json() as Record<string, unknown>[];
  const saved = rows[0] ? fromDatabaseRow(rows[0]) : theme;
  cacheTheme(saved);
  applyTheme(saved);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("upthink:theme:changed", { detail: saved }));
  return saved;
}

export async function resetTheme(): Promise<ThemeColors> {
  const saved = await saveThemeToDatabase(DEFAULT_THEME_COLORS);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("upthink:theme:changed", { detail: saved }));
  return saved;
}

if (typeof window !== "undefined") applyTheme(getStoredTheme());
