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

async function checkAdminWithCustomerToken(accessToken: string) {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) return false;

  try {
    return Boolean(await response.json());
  } catch {
    return false;
  }
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

  // Admin and customer credentials are backed by the same Supabase Auth
  // service, so the application must enforce the account role after login.
  // An admin account is never accepted as a customer account.
  if (data.access_token && (await checkAdminWithCustomerToken(data.access_token))) {
    try {
      await fetch(`${supabaseConfig.url}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: supabaseConfig.key,
          Authorization: `Bearer ${data.access_token}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      // Local customer session was never stored, so a logout failure here is safe.
    }

    throw new Error(
      "Tài khoản này dành cho quản trị viên. Hãy đăng nhập bằng tài khoản mua hàng riêng."
    );
  }

  setCustomerSession(data);
  return data;
}

export async function signUpCustomer(email: string, password: string) {
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
    // A newly registered customer should not be an admin. Keep the same
    // authorization boundary here in case the backend ever pre-assigns a role.
    if (await checkAdminWithCustomerToken(data.access_token)) {
      try {
        await fetch(`${supabaseConfig.url}/auth/v1/logout`, {
          method: "POST",
          headers: {
            apikey: supabaseConfig.key,
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        });
      } catch {
        // Do not persist a customer session for an admin account.
      }

      throw new Error(
        "Email này thuộc tài khoản quản trị viên và không thể đăng ký tài khoản mua hàng."
      );
    }

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

  if (await checkAdminWithCustomerToken(session.access_token)) {
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
