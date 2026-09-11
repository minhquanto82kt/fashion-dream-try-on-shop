import { setSession, supabaseConfig, type Session } from "@/lib/upthink-supabase";

export async function signUp(email: string, password: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  let data: Session & { user?: { id: string; email?: string } };

  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    throw new Error(text || `Đăng ký thất bại (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      data?.user?.email
        ? "Không thể tạo tài khoản."
        : ((data as { msg?: string; message?: string; error_description?: string })
            .msg ||
            (data as { message?: string }).message ||
            (data as { error_description?: string }).error_description ||
            "Không thể tạo tài khoản.")
    );
  }

  if (data.access_token) {
    setSession(data);
  }

  return data;
}
