const BRANDING_BUCKET = "site-branding";
const BRANDING_PATH = "logo";
const FAVICON_PATH = "favicon";
const BRANDING_ENDPOINT = "/rest/v1/site_branding";
const ADMIN_SESSION_KEY = "upthink_admin_session";

export const SUPPORTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const SUPPORTED_FAVICON_TYPES = ["image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"] as const;
export const MAX_LOGO_SIZE = 2 * 1024 * 1024;
export const MAX_FAVICON_SIZE = 512 * 1024;
export type BrandingSettings = { logoUrl: string | null; faviconUrl?: string | null };
type AdminSession = { access_token?: string };

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;
  return url && key ? { url, key } : null;
}
function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try { const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY); if (!raw) return null; const session = JSON.parse(raw) as AdminSession; return typeof session.access_token === "string" && session.access_token.length > 0 ? session.access_token : null; } catch { return null; }
}
function fromRow(row: Record<string, unknown> | undefined): BrandingSettings {
  return {
    logoUrl: typeof row?.logo_url === "string" && row.logo_url.length > 0 ? row.logo_url : null,
    faviconUrl: typeof row?.favicon_url === "string" && row.favicon_url.length > 0 ? row.favicon_url : "/favicon.ico",
  };
}

function applyBrandIdentity(): void {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLElement>(".fashion-brand__name").forEach((el) => { el.innerHTML = "WEARO<span>.</span>"; });
  document.querySelectorAll<HTMLElement>(".fashion-brand__meta").forEach((el) => { el.textContent = "WEAR + OWN / 2026"; });
  document.querySelectorAll<HTMLElement>(".fashion-menu-kicker").forEach((el) => { if (el.textContent?.includes("UPTHINK")) el.textContent = "WEARO / NAVIGATION"; });
  document.querySelectorAll<HTMLElement>(".fashion-menu-footer span").forEach((el) => { if (el.textContent?.includes("UPTHINK")) el.textContent = "WEARO / IUH — SAIGON 2026"; });
}

function applyFavicon(faviconUrl: string | null | undefined): void {
  if (typeof document === "undefined") return;
  const url = faviconUrl || "/favicon.ico";
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]');
  const primary = links[0] ?? document.createElement("link");
  primary.rel = "icon";
  primary.href = url;
  if (!primary.parentNode) document.head.appendChild(primary);
  links.forEach((link) => { if (link !== primary) link.remove(); });
}

export function applyBranding(branding: BrandingSettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  applyBrandIdentity();
  applyFavicon(branding.faviconUrl);
  if (branding.logoUrl) {
    root.style.setProperty("--site-logo-url", `url(\"${branding.logoUrl.replace(/\"/g, "\\\"")}\")`);
    root.dataset.siteLogo = "custom";
  } else { root.style.removeProperty("--site-logo-url"); delete root.dataset.siteLogo; }
}

function installBrandingStyles(): void {
  if (typeof document === "undefined" || document.getElementById("upthink-branding-runtime-style")) return;
  const style = document.createElement("style"); style.id = "upthink-branding-runtime-style";
  style.textContent = `
    html[data-site-logo=custom] .fashion-brand__mark { color: transparent !important; background-color: transparent !important; background-image: var(--site-logo-url) !important; background-repeat: no-repeat !important; background-position: center !important; background-size: contain !important; }
    html[data-site-logo=custom] .upthink-footer a[aria-label="UpThink home"] > span:first-child { color: transparent !important; background-color: transparent !important; background-image: var(--site-logo-url) !important; background-repeat: no-repeat !important; background-position: center !important; background-size: contain !important; font-size: 0 !important; }
  `;
  document.head.appendChild(style);
}

export async function loadBranding(): Promise<BrandingSettings> {
  const config = getSupabaseConfig(); if (!config) return { logoUrl: null, faviconUrl: "/favicon.ico" };
  try {
    const response = await fetch(`${config.url}${BRANDING_ENDPOINT}?id=eq.global&select=logo_url,favicon_url`, { headers: { apikey: config.key } });
    if (!response.ok) return { logoUrl: null, faviconUrl: "/favicon.ico" };
    const rows = await response.json() as Record<string, unknown>[]; const branding = fromRow(rows[0]); applyBranding(branding); return branding;
  } catch { return { logoUrl: null, faviconUrl: "/favicon.ico" }; }
}

export async function uploadLogo(file: File): Promise<BrandingSettings> {
  if (!SUPPORTED_LOGO_TYPES.includes(file.type as (typeof SUPPORTED_LOGO_TYPES)[number])) throw new Error("Logo chỉ hỗ trợ PNG, JPEG, SVG hoặc WebP.");
  if (file.size > MAX_LOGO_SIZE) throw new Error("Logo phải có dung lượng tối đa 2 MB.");
  const config = getSupabaseConfig(); const accessToken = getAdminAccessToken();
  if (!config) throw new Error("Supabase configuration is missing.");
  if (!accessToken) throw new Error("Admin session expired. Please sign in again.");
  const uploadResponse = await fetch(`${config.url}/storage/v1/object/${BRANDING_BUCKET}/${BRANDING_PATH}`, { method: "POST", headers: { apikey: config.key, Authorization: `Bearer ${accessToken}`, "Content-Type": file.type, "x-upsert": "true", "cache-control": "0" }, body: file });
  if (!uploadResponse.ok) { const detail = await uploadResponse.text(); throw new Error(`Logo upload failed (${uploadResponse.status}). ${detail.slice(0, 180)}`); }
  const publicUrl = `${config.url}/storage/v1/object/public/${BRANDING_BUCKET}/${BRANDING_PATH}?v=${Date.now()}`;
  const updateResponse = await fetch(`${config.url}${BRANDING_ENDPOINT}?id=eq.global`, { method: "PATCH", headers: { apikey: config.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ logo_url: publicUrl }) });
  if (!updateResponse.ok) { const detail = await updateResponse.text(); throw new Error(`Logo setting save failed (${updateResponse.status}). ${detail.slice(0, 180)}`); }
  const rows = await updateResponse.json() as Record<string, unknown>[]; const branding = fromRow(rows[0]); applyBranding(branding);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("upthink:branding:changed", { detail: branding }));
  return branding;
}

export async function uploadFavicon(file: File): Promise<BrandingSettings> {
  if (!SUPPORTED_FAVICON_TYPES.includes(file.type as (typeof SUPPORTED_FAVICON_TYPES)[number])) throw new Error("Favicon chỉ hỗ trợ PNG, ICO hoặc SVG.");
  if (file.size > MAX_FAVICON_SIZE) throw new Error("Favicon phải có dung lượng tối đa 512 KB.");
  const config = getSupabaseConfig(); const accessToken = getAdminAccessToken();
  if (!config) throw new Error("Supabase configuration is missing.");
  if (!accessToken) throw new Error("Admin session expired. Please sign in again.");
  const uploadResponse = await fetch(`${config.url}/storage/v1/object/${BRANDING_BUCKET}/${FAVICON_PATH}`, { method: "POST", headers: { apikey: config.key, Authorization: `Bearer ${accessToken}`, "Content-Type": file.type, "x-upsert": "true", "cache-control": "0" }, body: file });
  if (!uploadResponse.ok) { const detail = await uploadResponse.text(); throw new Error(`Favicon upload failed (${uploadResponse.status}). ${detail.slice(0, 180)}`); }
  const publicUrl = `${config.url}/storage/v1/object/public/${BRANDING_BUCKET}/${FAVICON_PATH}?v=${Date.now()}`;
  const updateResponse = await fetch(`${config.url}${BRANDING_ENDPOINT}?id=eq.global`, { method: "PATCH", headers: { apikey: config.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ favicon_url: publicUrl }) });
  if (!updateResponse.ok) { const detail = await updateResponse.text(); throw new Error(`Favicon setting save failed (${updateResponse.status}). ${detail.slice(0, 180)}`); }
  const rows = await updateResponse.json() as Record<string, unknown>[]; const branding = fromRow(rows[0]); applyBranding(branding);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("upthink:branding:changed", { detail: branding }));
  return branding;
}

if (typeof document !== "undefined") { installBrandingStyles(); void loadBranding(); }
