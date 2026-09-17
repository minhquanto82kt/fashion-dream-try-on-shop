const DEFAULT_SITE_URL = "https://fashion-dream-try-on-main-l56ej9gpx-up-think.vercel.app";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalLink(path = "/") {
  return {
    rel: "canonical",
    href: absoluteUrl(path),
  };
}
