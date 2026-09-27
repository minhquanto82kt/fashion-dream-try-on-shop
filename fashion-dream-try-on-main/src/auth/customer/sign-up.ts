import { supabaseConfig } from "@/lib/upthink-supabase";
import type { AuthResponse } from "../auth.types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getErrorMessage(data: AuthResponse) {
  return data.msg || data.message || data.error_description || data.error || "Không thể tạo tài khoản.";
}

/**
 * Customer sign-up entry point.
 * Supabase remains responsible for the Confirm sign up email template.
 */
export async function signUpCustomer(email: string, password: string, redirectTo?: string, fullName?: string) {
  const normalizedEmail = normalizeEmail(email);
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const response = await fetch(`${supabaseConfig.url}/auth/v1/signup${query}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: normalizedEmail,
      password,
      ...(fullName?.trim() ? { data: { full_name: fullName.trim() } } : {}),
    }),
  });

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = JSON.parse(text) as AuthResponse;
  } catch {
    throw new Error(text || `Không thể tạo tài khoản (${response.status}).`);
  }

  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
}

/** Resend the Supabase Confirm sign up email using the WEARO redirect URL. */
export async function resendSignupConfirmation(email: string, redirectTo?: string) {
  const normalizedEmail = normalizeEmail(email);
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const response = await fetch(`${supabaseConfig.url}/auth/v1/resend${query}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "signup", email: normalizedEmail }),
  });

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = JSON.parse(text) as AuthResponse;
  } catch {
    throw new Error(text || `Không thể gửi lại email xác nhận (${response.status}).`);
  }

  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
}
