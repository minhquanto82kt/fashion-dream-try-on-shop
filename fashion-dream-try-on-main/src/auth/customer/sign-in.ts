import { supabaseConfig } from "@/lib/upthink-supabase";
import type { AuthResponse } from "../auth.types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getErrorMessage(data: AuthResponse) {
  return data.msg || data.message || data.error_description || data.error || "Đăng nhập thất bại.";
}

export async function signInCustomerWithPassword(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  });

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = JSON.parse(text) as AuthResponse;
  } catch {
    throw new Error(text || `Đăng nhập thất bại (${response.status}).`);
  }
  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
}

/** Sends Supabase's Magic link / OTP email template. */
export async function sendMagicLink(email: string, redirectTo?: string) {
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const response = await fetch(`${supabaseConfig.url}/auth/v1/otp${query}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizeEmail(email), create_user: false }),
  });

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = text ? (JSON.parse(text) as AuthResponse) : {};
  } catch {
    throw new Error(text || `Không thể gửi Magic link (${response.status}).`);
  }
  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
}

export function getGoogleAuthorizeUrl(redirectTo: string) {
  const url = new URL(`${supabaseConfig.url}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", redirectTo);
  return url.toString();
}

export function getFacebookAuthorizeUrl(redirectTo: string) {
  const url = new URL(`${supabaseConfig.url}/auth/v1/authorize`);
  url.searchParams.set("provider", "facebook");
  url.searchParams.set("redirect_to", redirectTo);
  return url.toString();
}
