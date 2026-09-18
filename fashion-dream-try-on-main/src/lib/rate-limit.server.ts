type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 30;

export function getClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip")?.trim();
  return (forwarded || real || "unknown").slice(0, 128);
}

export function checkRateLimit(key: string, limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfterSeconds: 0 };
}

export function rateLimitResponse(retryAfterSeconds: number, requestId?: string) {
  const headers = new Headers({ "content-type": "application/json", "retry-after": String(Math.max(1, retryAfterSeconds)), "cache-control": "no-store" });
  if (requestId) headers.set("x-request-id", requestId);
  return new Response(JSON.stringify({ ok: false, error: "RATE_LIMITED", message: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }), { status: 429, headers });
}
