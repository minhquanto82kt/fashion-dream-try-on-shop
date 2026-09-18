import { fetchWithTimeoutAndRetry } from "@/lib/server-reliability";

export async function supabaseUserRequest<T>(path: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const token = accessToken.trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Thiếu cấu hình Supabase public key trên server.");
  const headers = new Headers(options.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("Prefer", "return=representation");
  const response = await fetchWithTimeoutAndRetry(`${url}/rest/v1/${path}`, { ...options, headers });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    const error = new Error(detail || `Supabase request failed (${response.status})`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
