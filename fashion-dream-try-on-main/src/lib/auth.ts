import { supabaseConfig, type Session } from "@/lib/upthink-supabase";

const CUSTOMER_SESSION_KEY = "upthink_customer_session";
const GUEST_CART_KEY = "upthink-cart";
const CUSTOMER_CART_PREFIX = "upthink-cart:user:";

type AuthUser = { id: string; email?: string };
type AuthResponse = Session & { user?: AuthUser; msg?: string; message?: string; error_description?: string };
type CartLine = { productId: string; size: string; color: string; qty: number };

export function getCustomerSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}

function setCustomerSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
}

function dispatchAuthEvent(type: "login" | "logout") {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(`upthink:auth:${type}`));
}

function readCart(key: string): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((line) => line && typeof line.productId === "string") : [];
  } catch { return []; }
}

function mergeCartLines(primary: CartLine[], secondary: CartLine[]) {
  const merged = [...primary];
  for (const incoming of secondary) {
    const index = merged.findIndex((line) => line.productId === incoming.productId && line.size === incoming.size && line.color === incoming.color);
    if (index === -1) merged.push({ ...incoming, qty: Math.max(1, Math.min(99, Number(incoming.qty) || 1)) });
    else merged[index] = { ...merged[index], qty: Math.max(1, Math.min(99, merged[index].qty + (Number(incoming.qty) || 1))) };
  }
  return merged;
}

function syncCartForCustomer(userId: string) {
  if (typeof window === "undefined") return;
  const customerKey = `${CUSTOMER_CART_PREFIX}${userId}`;
  const merged = mergeCartLines(readCart(customerKey), readCart(GUEST_CART_KEY));
  window.localStorage.setItem(customerKey, JSON.stringify(merged));
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(merged));
}

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const text = await response.text();
  let data: AuthResponse;
  try { data = JSON.parse(text) as AuthResponse; }
  catch { throw new Error(text || `Yêu cầu xác thực thất bại (${response.status})`); }
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "Yêu cầu xác thực thất bại.");
  return data;
}

async function checkAdminWithCustomerToken(accessToken: string) {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error(`Không thể xác minh quyền tài khoản (${response.status}).`);
  try { return Boolean(await response.json()); } catch { throw new Error("Không thể xác minh quyền tài khoản."); }
}

async function rejectAdminCustomerSession(accessToken: string, message: string): Promise<never> {
  try { await fetch(`${supabaseConfig.url}/auth/v1/logout`, { method: "POST", headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }); } catch {}
  throw new Error(message);
}

export async function signInCustomer(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  const data = await parseAuthResponse(response);
  if (data.access_token && (await checkAdminWithCustomerToken(data.access_token))) return rejectAdminCustomerSession(data.access_token, "Tài khoản này dành cho quản trị viên. Hãy đăng nhập bằng tài khoản mua hàng riêng.");
  setCustomerSession(data);
  if (data.user?.id) syncCartForCustomer(data.user.id);
  dispatchAuthEvent("login");
  return data;
}

export async function signUpCustomer(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/signup`, {
    method: "POST", headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  const data = await parseAuthResponse(response);
  if (data.access_token) {
    if (await checkAdminWithCustomerToken(data.access_token)) return rejectAdminCustomerSession(data.access_token, "Email này thuộc tài khoản quản trị viên và không thể đăng ký tài khoản mua hàng.");
    setCustomerSession(data);
    if (data.user?.id) syncCartForCustomer(data.user.id);
    dispatchAuthEvent("login");
  }
  return data;
}

export async function refreshCustomerSession() {
  const session = getCustomerSession();
  if (!session?.refresh_token) return null;
  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST", headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!response.ok) { setCustomerSession(null); dispatchAuthEvent("logout"); return null; }
  const next = await parseAuthResponse(response); setCustomerSession(next); return next;
}

export async function getCustomerUser() {
  const session = getCustomerSession();
  if (!session?.access_token) return null;
  let response = await fetch(`${supabaseConfig.url}/auth/v1/user`, { headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${session.access_token}` } });
  if (response.status === 401) {
    const refreshed = await refreshCustomerSession();
    if (!refreshed?.access_token) return null;
    response = await fetch(`${supabaseConfig.url}/auth/v1/user`, { headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${refreshed.access_token}` } });
  }
  if (!response.ok) { setCustomerSession(null); return null; }
  try {
    const active = getCustomerSession();
    if (!active?.access_token || await checkAdminWithCustomerToken(active.access_token)) { setCustomerSession(null); return null; }
  } catch { setCustomerSession(null); return null; }
  return (await response.json()) as AuthUser;
}

export async function signOutCustomer() {
  const session = getCustomerSession();
  if (session?.access_token) {
    try { await fetch(`${supabaseConfig.url}/auth/v1/logout`, { method: "POST", headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" } }); } catch {}
  }
  setCustomerSession(null);
  if (typeof window !== "undefined") window.localStorage.setItem(GUEST_CART_KEY, "[]");
  dispatchAuthEvent("logout");
}

export function isCustomerAuthenticated() { return Boolean(getCustomerSession()?.access_token); }

export function startCustomerSessionWatcher(onChange: (session: Session | null) => void) {
  if (typeof window === "undefined") return () => undefined;
  let stopped = false;
  const check = async () => {
    if (stopped) return;
    const session = getCustomerSession();
    if (!session) { onChange(null); return; }
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    onChange(expiresAt && expiresAt - Date.now() < 60_000 ? await refreshCustomerSession() : session);
  };
  void check();
  const timer = window.setInterval(() => void check(), 60_000);
  const onStorage = (event: StorageEvent) => { if (event.key === CUSTOMER_SESSION_KEY) onChange(getCustomerSession()); };
  window.addEventListener("storage", onStorage);
  return () => { stopped = true; window.clearInterval(timer); window.removeEventListener("storage", onStorage); };
}

export function getSafeReturnPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
