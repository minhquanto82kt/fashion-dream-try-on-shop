import { supabaseConfig, type Session } from "@/lib/upthink-supabase";

const CUSTOMER_SESSION_KEY = "upthink_customer_session";
const GUEST_CART_KEY = "upthink-cart";
const CUSTOMER_CART_PREFIX = "upthink-cart:user:";
const SIGNUP_COOLDOWN_PREFIX = "upthink_signup_cooldown:";
type AuthUser = { id: string; email?: string };
type AuthResponse = Session & { user?: AuthUser; msg?: string; message?: string; error_description?: string; error?: string; error_code?: string; code?: string };
type CartLine = { productId: string; size: string; color: string; qty: number };

function getAuthErrorMessage(data: AuthResponse) {
  return data.msg || data.message || data.error_description || data.error || "Yêu cầu xác thực thất bại.";
}

function getSignupRateLimitMessage(data: AuthResponse, response: Response) {
  const raw = getAuthErrorMessage(data);
  const match = raw.match(/after\s+(\d+)\s+seconds?/i);
  if (response.status === 429 || data.error_code === "over_email_send_rate_limit" || /for security purposes/i.test(raw)) {
    const seconds = match?.[1];
    return seconds
      ? `Vì lý do bảo mật, bạn cần chờ khoảng ${seconds} giây trước khi gửi lại yêu cầu đăng ký.`
      : "Bạn đã gửi yêu cầu đăng ký quá nhanh. Vui lòng chờ một chút rồi thử lại.";
  }
  return raw;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getSignupCooldownKey(email: string) {
  return `${SIGNUP_COOLDOWN_PREFIX}${normalizeEmail(email)}`;
}

function getSignupCooldownRemaining(email: string) {
  if (typeof window === "undefined") return 0;
  const value = Number(window.sessionStorage.getItem(getSignupCooldownKey(email)) || 0);
  return Math.max(0, Math.ceil((value - Date.now()) / 1000));
}

function setSignupCooldown(email: string, seconds: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(getSignupCooldownKey(email), String(Date.now() + seconds * 1000));
}

export function getCustomerSession(): Session | null {
  if (typeof window === "undefined") return null;
  try { const raw = window.localStorage.getItem(CUSTOMER_SESSION_KEY); return raw ? (JSON.parse(raw) as Session) : null; } catch { return null; }
}
function setCustomerSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session)); else window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
}
function dispatchAuthEvent(type: "login" | "logout") { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(`upthink:auth:${type}`)); }
function dispatchCartChanged() { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("upthink:cart:changed")); }
function dispatchAuthError(message: string) { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("upthink:auth:error", { detail: { message } })); }
function readCart(key: string): CartLine[] {
  if (typeof window === "undefined") return [];
  try { const value = JSON.parse(window.localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value.filter((line) => line && typeof line.productId === "string") : []; } catch { return []; }
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
  dispatchCartChanged();
}
async function parseAuthResponse(response: Response, context: "auth" | "signup" = "auth"): Promise<AuthResponse> {
  const text = await response.text();
  let data: AuthResponse;
  try { data = JSON.parse(text) as AuthResponse; } catch { throw new Error(text || `Yêu cầu xác thực thất bại (${response.status})`); }
  if (!response.ok) throw new Error(context === "signup" ? getSignupRateLimitMessage(data, response) : getAuthErrorMessage(data));
  return data;
}
async function checkAdminWithCustomerToken(accessToken: string) {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/rpc/is_admin`, { method: "POST", headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({}) });
  if (!response.ok) throw new Error(`Không thể xác minh quyền tài khoản (${response.status}).`);
  try { return Boolean(await response.json()); } catch { throw new Error("Không thể xác minh quyền tài khoản."); }
}
async function rejectAdminCustomerSession(accessToken: string, message: string): Promise<never> {
  try { await fetch(`${supabaseConfig.url}/auth/v1/logout`, { method: "POST", headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }); } catch {}
  throw new Error(message);
}
export async function signInCustomer(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" }, body: JSON.stringify({ email: normalizeEmail(email), password }) });
  const data = await parseAuthResponse(response);
  if (data.access_token && (await checkAdminWithCustomerToken(data.access_token))) return rejectAdminCustomerSession(data.access_token, "Tài khoản này dành cho quản trị viên. Hãy đăng nhập bằng tài khoản mua hàng riêng.");
  setCustomerSession(data);
  if (data.user?.id) syncCartForCustomer(data.user.id);
  dispatchAuthEvent("login");
  return data;
}

export function signInWithGoogle() {
  if (typeof window === "undefined") return;
  const redirectTo = `${window.location.origin}/account`;
  const authorizeUrl = new URL(`${supabaseConfig.url}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);
  window.location.assign(authorizeUrl.toString());
}

async function handleGoogleCallback() {
  if (typeof window === "undefined" || !window.location.hash.includes("access_token=")) return;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return;

  const expiresIn = Number(params.get("expires_in") || 3600);
  const expiresAt = Number(params.get("expires_at") || Math.floor(Date.now() / 1000) + expiresIn);
  const session: Session = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: params.get("token_type") || "bearer",
    expires_in: expiresIn,
    expires_at: expiresAt,
  };

  try {
    if (await checkAdminWithCustomerToken(accessToken)) {
      await rejectAdminCustomerSession(accessToken, "Tài khoản Google này thuộc khu vực quản trị viên và không thể dùng để mua hàng.");
    }
    const userResponse = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
      headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${accessToken}` },
    });
    if (!userResponse.ok) throw new Error("Không thể xác minh tài khoản Google.");
    const user = (await userResponse.json()) as AuthUser;
    setCustomerSession({ ...session, user });
    syncCartForCustomer(user.id);
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    dispatchAuthEvent("login");
  } catch (error) {
    setCustomerSession(null);
    const message = error instanceof Error ? error.message : "Đăng nhập Google thất bại.";
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    dispatchAuthError(message);
  }
}

export async function signUpCustomer(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const remaining = getSignupCooldownRemaining(normalizedEmail);
  if (remaining > 0) throw new Error(`Vui lòng chờ ${remaining} giây trước khi gửi lại yêu cầu đăng ký.`);

  const response = await fetch(`${supabaseConfig.url}/auth/v1/signup`, { method: "POST", headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" }, body: JSON.stringify({ email: normalizedEmail, password }) });
  const data = await parseAuthResponse(response, "signup");
  if (data.access_token) {
    if (await checkAdminWithCustomerToken(data.access_token)) return rejectAdminCustomerSession(data.access_token, "Email này thuộc tài khoản quản trị viên và không thể đăng ký tài khoản mua hàng.");
    setCustomerSession(data);
    if (data.user?.id) syncCartForCustomer(data.user.id);
    dispatchAuthEvent("login");
  } else {
    setSignupCooldown(normalizedEmail, 60);
  }
  return data;
}
export async function refreshCustomerSession() {
  const session = getCustomerSession(); if (!session?.refresh_token) return null;
  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
  if (!response.ok) { setCustomerSession(null); dispatchAuthEvent("logout"); return null; }
  const next = await parseAuthResponse(response); setCustomerSession(next); return next;
}
export async function getCustomerUser() {
  const session = getCustomerSession(); if (!session?.access_token) return null;
  let response = await fetch(`${supabaseConfig.url}/auth/v1/user`, { headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${session.access_token}` } });
  if (response.status === 401) {
    const refreshed = await refreshCustomerSession(); if (!refreshed?.access_token) return null;
    response = await fetch(`${supabaseConfig.url}/auth/v1/user`, { headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${refreshed.access_token}` } });
  }
  if (!response.ok) { setCustomerSession(null); return null; }
  try { const active = getCustomerSession(); if (!active?.access_token || await checkAdminWithCustomerToken(active.access_token)) { setCustomerSession(null); return null; } } catch { setCustomerSession(null); return null; }
  return (await response.json()) as AuthUser;
}
export async function signOutCustomer() {
  const session = getCustomerSession();
  if (session?.access_token) { try { await fetch(`${supabaseConfig.url}/auth/v1/logout`, { method: "POST", headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" } }); } catch {} }
  setCustomerSession(null);
  if (typeof window !== "undefined") { window.localStorage.setItem(GUEST_CART_KEY, "[]"); dispatchCartChanged(); }
  dispatchAuthEvent("logout");
}
export function isCustomerAuthenticated() { return Boolean(getCustomerSession()?.access_token); }
export function startCustomerSessionWatcher(onChange: (session: Session | null) => void) {
  if (typeof window === "undefined") return () => undefined;
  let stopped = false;
  const check = async () => {
    if (stopped) return; const session = getCustomerSession(); if (!session) { onChange(null); return; }
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    onChange(expiresAt && expiresAt - Date.now() < 60_000 ? await refreshCustomerSession() : session);
  };
  void check(); const timer = window.setInterval(() => void check(), 60_000);
  const onStorage = (event: StorageEvent) => { if (event.key === CUSTOMER_SESSION_KEY) onChange(getCustomerSession()); };
  window.addEventListener("storage", onStorage);
  return () => { stopped = true; window.clearInterval(timer); window.removeEventListener("storage", onStorage); };
}
export function getSafeReturnPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function installGoogleAccountButton() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const mount = () => {
    const switcher = document.querySelector<HTMLElement>(".account-switch");
    if (!switcher || document.querySelector("[data-google-account-button]")) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-google-account-button", "true");
    wrapper.innerHTML = `
      <div class="account-google-divider"><span>OR CONTINUE WITH</span></div>
      <button type="button" class="account-google-button" aria-label="Continue with Google">
        <span class="account-google-icon" aria-hidden="true">G</span>
        <span>Continue with Google</span>
      </button>
    `;
    switcher.insertAdjacentElement("afterend", wrapper);
    wrapper.querySelector("button")?.addEventListener("click", () => signInWithGoogle());

    const style = document.createElement("style");
    style.setAttribute("data-google-account-style", "true");
    style.textContent = `
      .account-google-divider { display:flex; align-items:center; gap:12px; margin:0 0 18px; color:rgba(230,213,184,.36); font-size:7px; font-weight:900; letter-spacing:.16em; }
      .account-google-divider::before,.account-google-divider::after { content:""; height:1px; flex:1; background:rgba(230,213,184,.14); }
      .account-google-button { width:100%; min-height:46px; display:flex; align-items:center; justify-content:center; gap:10px; border:1px solid rgba(230,213,184,.24); background:rgba(27,26,23,.42); color:#e6d5b8; cursor:pointer; font:inherit; font-size:8px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; transition:border-color .2s ease,background .2s ease,transform .2s ease; }
      .account-google-button:hover { border-color:rgba(240,165,0,.72); background:rgba(27,26,23,.62); transform:translateY(-1px); }
      .account-google-icon { display:grid; place-items:center; width:20px; height:20px; border-radius:50%; background:#fff; color:#4285f4; font-family:Arial,sans-serif; font-size:13px; font-weight:700; letter-spacing:0; text-transform:none; }
      @media (prefers-reduced-motion: reduce) { .account-google-button { transition:none; } }
    `;
    document.head.appendChild(style);
  };
  const callbackError = (event: Event) => {
    const customEvent = event as CustomEvent<{ message?: string }>;
    if (customEvent.detail?.message) {
      const existing = document.querySelector<HTMLElement>(".account-feedback--error");
      if (existing) existing.textContent = customEvent.detail.message;
    }
  };
  mount();
  const observer = new MutationObserver(mount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("upthink:auth:error", callbackError);
  window.setTimeout(() => observer.disconnect(), 10000);
}

if (typeof window !== "undefined") {
  void handleGoogleCallback();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installGoogleAccountButton, { once: true });
  else installGoogleAccountButton();
}
