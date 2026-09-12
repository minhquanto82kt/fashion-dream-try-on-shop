import "../admin-theme.css";

export type ThemeColors = { primary: string; secondary: string; background: string; surface: string; accent: string; foreground: string };
export const DEFAULT_THEME_COLORS: ThemeColors = { primary: "#2E2910", secondary: "#2C5745", background: "#2E2910", surface: "#0B0909", accent: "#EB7D00", foreground: "#EBE3A7" };
export const THEME_STORAGE_KEY = "upthink-theme-colors";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
export function isValidHexColor(value: string): boolean { return HEX_COLOR.test(value); }
export function sanitizeThemeColors(value: unknown): ThemeColors {
  if (!value || typeof value !== "object") return DEFAULT_THEME_COLORS;
  const candidate = value as Partial<Record<keyof ThemeColors, unknown>>;
  const next = { ...DEFAULT_THEME_COLORS };
  for (const key of Object.keys(DEFAULT_THEME_COLORS) as Array<keyof ThemeColors>) if (typeof candidate[key] === "string" && isValidHexColor(candidate[key])) next[key] = candidate[key] as string;
  return next;
}
export function getStoredTheme(): ThemeColors {
  if (typeof window === "undefined") return DEFAULT_THEME_COLORS;
  try { const raw = window.localStorage.getItem(THEME_STORAGE_KEY); return raw ? sanitizeThemeColors(JSON.parse(raw)) : DEFAULT_THEME_COLORS; } catch { return DEFAULT_THEME_COLORS; }
}
export function applyTheme(colors: ThemeColors): void {
  if (typeof document === "undefined") return;
  const theme = sanitizeThemeColors(colors);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) root.style.setProperty(`--theme-${key}`, value);
}
export function saveTheme(colors: ThemeColors): ThemeColors {
  const theme = sanitizeThemeColors(colors);
  if (typeof window !== "undefined") { window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme)); applyTheme(theme); window.dispatchEvent(new CustomEvent("upthink:theme:changed", { detail: theme })); }
  return theme;
}
export function resetTheme(): ThemeColors {
  if (typeof window !== "undefined") window.localStorage.removeItem(THEME_STORAGE_KEY);
  applyTheme(DEFAULT_THEME_COLORS);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("upthink:theme:changed", { detail: DEFAULT_THEME_COLORS }));
  return DEFAULT_THEME_COLORS;
}
if (typeof window !== "undefined") applyTheme(getStoredTheme());
