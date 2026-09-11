import { supabaseConfig } from "@/lib/upthink-supabase";

export type CustomerSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: { id: string; email?: string };
};

const SESSION_KEY = "upthink_customer_session";

export function getCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CustomerSession) : null;
  } catch {
    return null;
  }
}

function setCustomerSession(session: CustomerSession | null) {
  if (typeof window === "undefined") return;
  if (!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function authHeaders(token?: string) {
  return {
    apikey: supabaseConfig.key,
    Authorization: `Bearer ${token ?? supabaseConfig.key}`,
    "Content-Type": "application/json",
  };
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    throw new Error(data?.message || data?.error_description || data?.error || "Authentication request failed.");
  }
  return data as T;
}

export async function signInCustomer(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const session = await parse<CustomerSession>(response);
  setCustomerSession(session);
  return session;
}

export async function signUpCustomer(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/signup`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await parse<CustomerSession & { user?: CustomerSession["user"] }>(response);
  if (data?.access_token) setCustomerSession(data);
  return data;
}

export async function refreshCustomerSession() {
  const session = getCustomerSession();
  if (!session?.refresh_token) return null;

  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });

  if (!response.ok) {
    setCustomerSession(null);
    return null;
  }

  const next = await parse<CustomerSession>(response);
  setCustomerSession(next);
  return next;
}

export async function getCustomerUser() {
  const session = getCustomerSession();
  if (!session?.access_token) return null;

  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    headers: authHeaders(session.access_token),
  });

  if (response.status === 401) {
    const refreshed = await refreshCustomerSession();
    if (!refreshed?.access_token) return null;
    const retry = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
      headers: authHeaders(refreshed.access_token),
    });
    if (!retry.ok) return null;
    return parse<{ id: string; email?: string }>(retry);
  }

  if (!response.ok) return null;
  return parse<{ id: string; email?: string }>(response);
}

export async function signOutCustomer() {
  const session = getCustomerSession();
  if (session?.access_token) {
    try {
      await fetch(`${supabaseConfig.url}/auth/v1/logout`, {
        method: "POST",
        headers: authHeaders(session.access_token),
      });
    } catch {
      // Local logout must still complete when the network is unavailable.
    }
  }
  setCustomerSession(null);
}

export function isCustomerAuthenticated() {
  return Boolean(getCustomerSession()?.access_token);
}

export function startCustomerSessionWatcher(onChange: (session: CustomerSession | null) => void) {
  if (typeof window === "undefined") return () => undefined;
  let stopped = false;
  const check = async () => {
    if (stopped) return;
    const session = getCustomerSession();
    if (!session) { onChange(null); return; }
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    if (expiresAt && expiresAt - Date.now() < 60_000) {
      const refreshed = await refreshCustomerSession();
      onChange(refreshed);
    } else {
      onChange(session);
    }
  };
  void check();
  const timer = window.setInterval(() => void check(), 60_000);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) onChange(getCustomerSession());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSafeReturnPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
