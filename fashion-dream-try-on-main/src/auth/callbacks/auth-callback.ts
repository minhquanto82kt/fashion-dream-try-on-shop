import { supabaseConfig, type Session } from "@/lib/upthink-supabase";
import type { AuthUser } from "../auth.types";

export type AuthCallbackType = "login" | "recovery";

/**
 * Completes a Supabase implicit-flow callback without changing the existing
 * session storage contract. The legacy auth implementation still owns cart
 * synchronization and event dispatch while consumers migrate to @/auth.
 */
export async function resolveAuthCallback(hash: string): Promise<{ type: AuthCallbackType; session: Session; user: AuthUser } | null> {
  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalizedHash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;

  const expiresIn = Number(params.get("expires_in") || 3600);
  const expiresAt = Number(params.get("expires_at") || Math.floor(Date.now() / 1000) + expiresIn);
  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    headers: {
      apikey: supabaseConfig.key,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Không thể xác minh phiên xác thực.");

  const user = (await response.json()) as AuthUser;
  return {
    type: params.get("type") === "recovery" ? "recovery" : "login",
    session: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: params.get("token_type") || "bearer",
      expires_in: expiresIn,
      expires_at: expiresAt,
    },
    user,
  };
}
