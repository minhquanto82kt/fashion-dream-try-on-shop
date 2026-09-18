const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 2_000;

type LogLevel = "info" | "warn" | "error";
type LogValue = string | number | boolean | null | undefined;
export type ServerLogFields = Record<string, LogValue>;

export const REQUEST_ID_HEADER = "x-request-id";

export function createRequestId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the deterministic-safe fallback below.
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function logServerEvent(level: LogLevel, event: string, fields: ServerLogFields = {}) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...fields,
  });

  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}

function retryDelayMs(attempt: number, response?: Response): number {
  const retryAfter = response?.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1000, 100), MAX_RETRY_DELAY_MS);
  }
  return Math.min(250 * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function isRetryableMethod(method: string): boolean {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

export async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { timeoutMs?: number; retries?: number; requestId?: string } = {},
): Promise<Response> {
  const timeoutMs = Math.max(1_000, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const retries = Math.max(0, options.retries ?? DEFAULT_RETRIES);
  const method = (init.method ?? "GET").toUpperCase();
  const canRetry = isRetryableMethod(method);
  const requestId = options.requestId ?? createRequestId();

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    let externalAbortHandler: (() => void) | undefined;

    if (init.signal) {
      if (init.signal.aborted) controller.abort(init.signal.reason);
      else {
        externalAbortHandler = () => controller.abort(init.signal?.reason);
        init.signal.addEventListener("abort", externalAbortHandler, { once: true });
      }
    }

    const timeout = setTimeout(() => controller.abort(new Error("Request timed out")), timeoutMs);
    const headers = new Headers(init.headers);
    headers.set(REQUEST_ID_HEADER, requestId);

    try {
      const response = await fetch(input, { ...init, headers, signal: controller.signal });
      if (!canRetry || !isRetryableStatus(response.status) || attempt >= retries) return response;

      try {
        await response.body?.cancel();
      } catch {
        // The retry is still safe for idempotent requests.
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs(attempt, response)));
    } catch (error) {
      if (!canRetry || attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs(attempt)));
    } finally {
      clearTimeout(timeout);
      if (externalAbortHandler && init.signal) {
        init.signal.removeEventListener("abort", externalAbortHandler);
      }
    }
  }

  throw new Error("Request failed after retry policy was exhausted.");
}

export function safeLogError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  try {
    return JSON.stringify(error)?.slice(0, 500) ?? String(error).slice(0, 500);
  } catch {
    return String(error).slice(0, 500);
  }
}
