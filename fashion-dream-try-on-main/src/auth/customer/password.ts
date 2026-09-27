import { supabaseConfig, type Session } from "@/lib/upthink-supabase";
import type { AuthResponse } from "../auth.types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getErrorMessage(data: AuthResponse) {
  return data.msg || data.message || data.error_description || data.error || "Yêu cầu xác thực thất bại.";
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new Error("Vui lòng nhập email tài khoản.");

  const response = await fetch(`${supabaseConfig.url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = JSON.parse(text) as AuthResponse;
  } catch {
    throw new Error(text || `Không thể gửi email khôi phục (${response.status}).`);
  }
  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
}

export async function updateCustomerPassword(password: string, session: Session) {
  if (password.length < 6) throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
  if (!session.access_token) throw new Error("Liên kết khôi phục không còn hợp lệ. Hãy yêu cầu email khôi phục mới.");

  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: supabaseConfig.key,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = JSON.parse(text) as AuthResponse;
  } catch {
    throw new Error(text || `Không thể cập nhật mật khẩu (${response.status}).`);
  }
  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
}

export async function changeCustomerEmail(email: string, session: Session) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new Error("Vui lòng nhập email mới.");
  if (!session.access_token) throw new Error("Phiên đăng nhập không còn hợp lệ.");

  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: supabaseConfig.key,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = JSON.parse(text) as AuthResponse;
  } catch {
    throw new Error(text || `Không thể thay đổi email (${response.status}).`);
  }
  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
}
