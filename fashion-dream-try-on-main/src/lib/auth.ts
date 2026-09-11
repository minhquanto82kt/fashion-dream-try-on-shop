import { supabaseConfig, type Session } from "@/lib/upthink-supabase";

const CUSTOMER_SESSION_KEY = "upthink_customer_session";

type AuthUser = { id: string; email?: string };

type AuthResponse = Session & {
  user?: AuthUser;
  msg?: string;
  message?: string;
  error_description?: string;
};

function getCustomerSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CUSTOMER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function setCustomerSession(session: Session | null) {
  if (typeof window === "undefined") return;

  if (session) {
    window.sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  } else {
    window.sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
  }
}

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const text = await response.text();

  let data: AuthResponse;
  try {
    data = JSON.parse(text) as AuthResponse;
  } catch {
    throw new Error(text || `Yêu cầu xác thực thất bại (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      data.msg ||
        data.message ||
        data.error_description ||
        "Yêu cầu xác thực thất bại."
    );
  }

  return data;
}

export async function signInCustomer(email: string, password: string) {
  const response = await fetch(
    `${supabaseConfig.url}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: supabaseConfig.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await parseAuthResponse(response);
  setCustomerSession(data);
  return data;
}

export async function signUp(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseAuthResponse(response);

  if (data.access_token) {
    setCustomerSession(data);
  }

  return data;
}

export async function getCustomerUser() {
  const session = getCustomerSession();
  if (!session?.access_token) return null;

  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    headers: {
      apikey: supabaseConfig.key,
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    setCustomerSession(null);
    return null;
  }

  return (await response.json()) as AuthUser;
}

export async function signOutCustomer() {
  const session = getCustomerSession();

  if (session?.access_token) {
    try {
      await fetch(`${supabaseConfig.url}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: supabaseConfig.key,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      // Always clear the local session below.
    }
  }

  setCustomerSession(null);
}
