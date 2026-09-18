import { getRequestHeader } from "@tanstack/react-start/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const MAX_AI_REQUESTS_PER_WINDOW = 5;

const buckets = new Map<string, { count: number; resetAt: number }>();

function clientAddress(): string {
  const forwarded = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || getRequestHeader("x-real-ip")?.trim() || "unknown";
}

function consume(key: string, limit: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 60 };
  }
  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
}

export function enforceRequestRateLimit(scope: string, limit = MAX_REQUESTS_PER_WINDOW): Response | null {
  const result = consume(`${scope}:${clientAddress()}`, limit);
  if (result.allowed) return null;
  return new Response(JSON.stringify({ error: "RATE_LIMITED", message: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }), {
    status: 429,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "retry-after": String(result.retryAfterSeconds),
      "cache-control": "no-store",
    },
  });
}

export function enforceAiRateLimit(): Response | null {
  return enforceRequestRateLimit("ai", MAX_AI_REQUESTS_PER_WINDOW);
}

export function resetRequestRateLimitForTests(): void {
  buckets.clear();
}
