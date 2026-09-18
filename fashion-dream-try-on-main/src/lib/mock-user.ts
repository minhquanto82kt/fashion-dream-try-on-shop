export type MockUserRole = "customer";

export type MockUser = {
  id: "mock-user";
  role: MockUserRole;
  email: "mock-user@wearo.local";
  name: "Mock User";
};

export const MOCK_USER: MockUser = {
  id: "mock-user",
  role: "customer",
  email: "mock-user@wearo.local",
  name: "Mock User",
};

const STORAGE_KEY = "wearo:mock-user-mode";

export function isMockUserMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function enterMockUserMode(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, "1");
}

export function exitMockUserMode(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function getMockUser(): MockUser | null {
  return isMockUserMode() ? MOCK_USER : null;
}
