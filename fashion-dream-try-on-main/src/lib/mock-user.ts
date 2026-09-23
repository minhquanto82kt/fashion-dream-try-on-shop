export type MockUserRole = "customer";

export const MOCK_USER = {
  id: "preview-account-user",
  role: "customer" as const,
  email: "preview@wearo.local",
  name: "WEARO Preview User",
} as const;

const STORAGE_KEY = "wearo:mock-user-mode";
const PREVIEW_PARAM = "preview";
const MOCK_SESSION_EVENT = "wearo:mock-user:changed";

type MockUserChangeDetail = {
  active: boolean;
  user: typeof MOCK_USER | null;
};

function dispatchMockAuthEvent(type: "login" | "logout") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(`upthink:auth:${type}`, { detail: { mock: true, user: MOCK_USER } }));
}

function dispatchMockUserChanged(active: boolean) {
  if (typeof window === "undefined") return;
  const detail: MockUserChangeDetail = { active, user: active ? MOCK_USER : null };
  window.dispatchEvent(new CustomEvent(MOCK_SESSION_EVENT, { detail }));
}

export function isMockUserMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function enterMockUserMode(): void {
  if (typeof window === "undefined") return;
  if (isMockUserMode()) return;
  window.sessionStorage.setItem(STORAGE_KEY, "1");
  dispatchMockUserChanged(true);
  dispatchMockAuthEvent("login");
}

export function exitMockUserMode(): void {
  if (typeof window === "undefined") return;
  if (!isMockUserMode()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  dispatchMockUserChanged(false);
  dispatchMockAuthEvent("logout");
}

export function getMockUser() {
  return isMockUserMode() ? MOCK_USER : null;
}

export function subscribeToMockUser(callback: (detail: MockUserChangeDetail) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const listener = (event: Event) => callback((event as CustomEvent<MockUserChangeDetail>).detail);
  window.addEventListener(MOCK_SESSION_EVENT, listener);
  return () => window.removeEventListener(MOCK_SESSION_EVENT, listener);
}

/** URL flag is only a routing hint; the Admin-launched session remains authoritative. */
export function isMockUserPreviewUrl(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(PREVIEW_PARAM) === "1";
}

export function isMockUserPreviewActive(): boolean {
  return isMockUserMode() && isMockUserPreviewUrl();
}
