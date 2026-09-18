export const MOCK_USER = {
  id: "mock-user",
  role: "customer" as const,
  email: "mock-user@wearo.local",
  name: "Mock User",
} as const;

const STORAGE_KEY = "wearo:mock-user-mode";

export function isMockUserMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function enterMockUserMode(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event("wearo:mock-user:changed"));
}

export function exitMockUserMode(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("wearo:mock-user:changed"));
}

export function getMockUser() {
  return isMockUserMode() ? MOCK_USER : null;
}
