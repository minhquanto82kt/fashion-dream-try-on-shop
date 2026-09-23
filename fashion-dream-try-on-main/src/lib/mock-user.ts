export type MockUserRole = "customer";

export const MOCK_USER = {
  id: "preview-account-user",
  role: "customer" as const,
  email: "preview@wearo.local",
  name: "WEARO Preview User",
} as const;

const STORAGE_KEY = "wearo:mock-user-mode";
const PREVIEW_PARAM = "preview";

function dispatchMockAuthEvent(type: "login" | "logout") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(`upthink:auth:${type}`, { detail: { mock: true, user: MOCK_USER } }));
}

export function isMockUserMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function enterMockUserMode(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event("wearo:mock-user:changed"));
  dispatchMockAuthEvent("login");
}

export function exitMockUserMode(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("wearo:mock-user:changed"));
  dispatchMockAuthEvent("logout");
}

export function getMockUser() {
  return isMockUserMode() ? MOCK_USER : null;
}

/** URL flag is only a routing hint; the Admin-launched session remains authoritative. */
export function isMockUserPreviewUrl(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(PREVIEW_PARAM) === "1";
}

export function isMockUserPreviewActive(): boolean {
  return isMockUserMode() && isMockUserPreviewUrl();
}
