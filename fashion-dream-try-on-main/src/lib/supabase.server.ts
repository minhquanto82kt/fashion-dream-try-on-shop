type SupabaseConfig = {
  url: string;
  secretKey: string;
};

function getConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Thiếu cấu hình Supabase trên server.");
  }

  return { url, secretKey };
}

export async function supabaseRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { url, secretKey } = getConfig();

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase error ${response.status}: ${message}`);
  }

  return response.json() as Promise<T>;
}
