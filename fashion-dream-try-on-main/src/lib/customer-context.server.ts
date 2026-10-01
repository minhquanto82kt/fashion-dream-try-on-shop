import { getRequestHeader } from "@tanstack/react-start/server";

export type CustomerPlan = "guest-basic" | "loyalty" | "admin-mock";

export type CustomerContext = {
  kind: "guest" | "member" | "admin";
  plan: CustomerPlan;
  userId: string | null;
};

type SupabaseUser = { id?: string };

function getAccessTokenFromRequest(): string | null {
  const authorization = getRequestHeader("authorization")?.trim();
  if (!authorization || !/^Bearer\\s+/i.test(authorization)) return null;
  const token = authorization.replace(/^Bearer\\s+/i, "").trim();
  return token || null;
}

async function verifyAccessToken(accessToken: string): Promise<string> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new Error("Thiếu cấu hình Supabase trên server.");

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("CUSTOMER_AUTH_REQUIRED");

  const user = (await response.json()) as SupabaseUser;
  if (!user.id) throw new Error("CUSTOMER_AUTH_REQUIRED");
  return user.id;
}

async function isAdminUser(userId: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return false;

  const response = await fetch(
    `${url}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(userId)}&select=user_id&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );

  if (!response.ok) return false;
  const rows = (await response.json()) as Array<{ user_id?: string }>;
  return rows.some((row) => row.user_id === userId);
}

export async function resolveCustomerContext(): Promise<CustomerContext> {
  const accessToken = getAccessTokenFromRequest();

  if (!accessToken) {
    return { kind: "guest", plan: "guest-basic", userId: null };
  }

  const userId = await verifyAccessToken(accessToken);

  if (await isAdminUser(userId)) {
    return { kind: "admin", plan: "admin-mock", userId };
  }

  return { kind: "member", plan: "loyalty", userId };
}

export function assertTryOnEntitlement(context: CustomerContext): CustomerContext {
  if (context.kind === "guest" || context.kind === "member" || context.kind === "admin") return context;
  throw new Error("TRY_ON_NOT_ALLOWED");
}
