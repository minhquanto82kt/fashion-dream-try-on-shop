import type { Session } from "@/lib/upthink-supabase";

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type AuthResponse = Session & {
  user?: AuthUser;
  msg?: string;
  message?: string;
  error_description?: string;
  error?: string;
  error_code?: string;
  code?: string;
};

export type AuthResult = AuthResponse;

export type RedirectOptions = {
  redirectTo?: string;
};
