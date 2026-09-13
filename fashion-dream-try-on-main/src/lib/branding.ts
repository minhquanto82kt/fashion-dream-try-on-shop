const BRANDING_BUCKET = "site-branding";
const BRANDING_PATH = "logo";
const BRANDING_ENDPOINT = "/rest/v1/site_branding";
const ADMIN_SESSION_KEY = "upthink_admin_session";

export const SUPPORTED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export const MAX_LOGO_SIZE = 2 * 1024 * 1024;

export type BrandingSettings = {
  logoUrl: string | null;
};

type AdminSession = { access_token?: string };

function getSupabaseConfig(): { url: string; key: string } | null {
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
  } catch {
    return null;
  }
}

function fromRow(row: Record<string, unknown> | undefined): BrandingSettings {
  return { logoUrl: typeof row?.logo_url === "string" && row.logo_url.length > 0 ? row.logo_url : null };
}

export async function loadBranding(): Promise<BrandingSettings> {
  const config = getSupabaseConfig();
  if (!config) return { logoUrl: null };

  try {
    const response = await fetch(`${config.url}${BRANDING_ENDPOINT}?id=eq.global&select=logo_url` , {
      headers: { apikey: config.key },
    });
    if (!response.ok) return { logoUrl: null };
    const rows = await response.json() as Record<string, unknown>[];
    return fromRow(rows[0]);
  } catch {
    return { logoUrl: null };
  }
}

export async function uploadLogo(file: File): Promise<BrandingSettings> {
  if (!SUPPORTED_LOGO_TYPES.includes(file.type as (typeof SUPPORTED_LOGO_TYPES)[number])) {
    throw new Error("Logo chỉ hỗ trợ PNG, JPEG, SVG hoặc WebP.");
  }
  if (file.size > MAX_LOGO_SIZE) {
    throw new Error("Logo phải có dung lượng tối đa 2 MB.");
  }

  const config = getSupabaseConfig();
  const accessToken = getAdminAccessToken();
  if (!config) throw new Error("Supabase configuration is missing.");
  if (!accessToken) throw new Error("Admin session expired. Please sign in again.");

  const uploadResponse = await fetch(`${config.url}/storage/v1/object/${BRANDING_BUCKET}/${BRANDING_PATH}`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": file.type,
      "x-upsert": "true",
      "cache-control": "0",
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text();
    throw new Error(`Logo upload failed (${uploadResponse.status}). ${detail.slice(0, 180)}`);
  }

  const publicUrl = `${config.url}/storage/v1/object/public/${BRANDING_BUCKET}/${BRANDING_PATH}?v=${Date.now()}`;
  const updateResponse = await fetch(`${config.url}${BRANDING_ENDPOINT}?id=eq.global`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ logo_url: publicUrl }),
  });

  if (!updateResponse.ok) {
    const detail = await updateResponse.text();
    throw new Error(`Logo setting save failed (${updateResponse.status}). ${detail.slice(0, 180)}`);
  }

  const rows = await updateResponse.json() as Record<string, unknown>[];
  const branding = fromRow(rows[0]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("upthink:branding:changed", { detail: branding }));
  }
  return branding;
}
