type RetryPolicy = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRIES = 2;
const RETRYABLE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export class ServerHttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ServerHttpError";
    this.status = status;
    this.url = url;
  }
}

export function getRequestId(request?: Request): string {
  const incoming = request?.headers.get("x-request-id")?.trim();
  if (incoming && /^[A-Za-z0-9._:-]{8,128}$/.test(incoming)) return incoming;

  try {
    return crypto.randomUUID();
  } catch {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const upstreamSignal = init.signal;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (upstreamSignal) {
    if (upstreamSignal.aborted) controller.abort(upstreamSignal.reason);
    else upstreamSignal.addEventListener("abort", () => controller.abort(upstreamSignal.reason), { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted && !upstreamSignal?.aborted) {
      throw new ServerHttpError(`Upstream request timed out after ${timeoutMs}ms.`, 504, String(input), { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: RetryPolicy & { timeoutMs?: number } = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const canRetry = RETRYABLE_METHODS.has(method);
  const retries = canRetry ? Math.max(0, options.retries ?? DEFAULT_RETRIES) : 0;
  const baseDelayMs = Math.max(50, options.baseDelayMs ?? 250);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? 2_000);

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, init, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
      if (!canRetry || !RETRYABLE_STATUS.has(response.status) || attempt === retries) return response;
      await sleep(backoff(attempt, baseDelayMs, maxDelayMs));
    } catch (error) {
      lastError = error;
      if (!canRetry || attempt === retries) throw error;
      await sleep(backoff(attempt, baseDelayMs, maxDelayMs));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Upstream request failed.");
}

export function normalizeServerError(error: unknown, fallback = "Yêu cầu máy chủ thất bại."): { message: string; status: number } {
  if (error instanceof ServerHttpError) return { message: error.message, status: error.status };
  if (error instanceof Error) {
    const status = getErrorStatus(error);
    return { message: status >= 500 ? fallback : error.message || fallback, status };
  }
  return { message: fallback, status: 500 };
}

function getErrorStatus(error: Error): number {
  const value = (error as Error & { status?: unknown; statusCode?: unknown }).status ??
    (error as Error & { statusCode?: unknown }).statusCode;
  return typeof value === "number" && Number.isInteger(value) ? value : 500;
}

function backoff(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  return Math.round(exponential * (0.75 + Math.random() * 0.5));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
