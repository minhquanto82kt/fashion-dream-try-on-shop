import { getRequestHeader } from "@tanstack/react-start/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export type CustomerPlan = "guest-basic" | "loyalty" | "admin-mock";

export type CustomerContext = {
  kind: "guest" | "member" | "admin";
  plan: CustomerPlan;
  userId: string | null;
};

type SupabaseUser = { id?: string };

const MOCK_PREFIX = "wearo-mock-v1.";

function mockSecret(): string {
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!secret) throw new Error("Thiếu cấu hình server cho Mock User.");
  return secret;
}

function encodeMock(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeMock(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signMock(payload: string): string {
  return createHmac("sha256", mockSecret()).update(payload).digest("base64url");
}

function createMockToken(adminUserId: string): string {
  const payload = encodeMock(JSON.stringify({ sub: adminUserId, role: "admin-mock", exp: Date.now() + 60 * 60 * 1000 }));
  return `${MOCK_PREFIX}${payload}.${signMock(payload)}`;
}

function verifyMockToken(token: string): string | null {
  if (!token.startsWith(MOCK_PREFIX)) return null;
  const raw = token.slice(MOCK_PREFIX.length);
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) throw new Error("MOCK_SESSION_INVALID");
  const expected = signMock(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("MOCK_SESSION_INVALID");
  const parsed = JSON.parse(decodeMock(payload)) as { sub?: string; role?: string; exp?: number };
  if (parsed.role !== "admin-mock" || !parsed.sub || !parsed.exp || parsed.exp < Date.now()) throw new Error("MOCK_SESSION_EXPIRED");
  return parsed.sub;
}


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

export async function resolveCustomerContext(accessTokenOverride?: string): Promise<CustomerContext> {
  const accessToken = accessTokenOverride?.trim() || getAccessTokenFromRequest();

  if (!accessToken) {
    return { kind: "guest", plan: "guest-basic", userId: null };
  }

  const mockUserId = verifyMockToken(accessToken);
  if (mockUserId) return { kind: "admin", plan: "admin-mock", userId: mockUserId };

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

export async function createAdminMockSession(adminAccessToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const adminUserId = await verifyAccessToken(adminAccessToken.trim());
  if (!(await isAdminUser(adminUserId))) throw new Error("ADMIN_REQUIRED");
  return { accessToken: createMockToken(adminUserId), expiresIn: 3600 };
}
