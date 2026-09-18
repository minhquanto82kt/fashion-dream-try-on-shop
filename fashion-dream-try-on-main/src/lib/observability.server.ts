type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const REDACT_KEYS = /authorization|cookie|token|secret|password|api[-_]?key/i;

export function logServer(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service: "wearo-web",
    event,
    ...sanitizeContext(context),
  };

  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export function logRequest(input: {
  requestId: string;
  request: Request;
  response: Response;
  durationMs: number;
}) {
  const url = new URL(input.request.url);
  const level: LogLevel = input.response.status >= 500 ? "error" : input.response.status >= 400 ? "warn" : "info";

  logServer(level, "http.request", {
    requestId: input.requestId,
    method: input.request.method,
    path: url.pathname,
    status: input.response.status,
    durationMs: Math.round(input.durationMs),
    userAgent: input.request.headers.get("user-agent")?.slice(0, 200) ?? undefined,
  });
}

export function logServerError(event: string, error: unknown, context: LogContext = {}) {
  const detail = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: String(error) };
  logServer("error", event, { ...context, error: sanitizeContext(detail) });
}

function sanitizeContext(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeContext);
  if (!value || typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (REDACT_KEYS.test(key)) output[key] = "[REDACTED]";
    else if (typeof child === "string") output[key] = child.length > 2_000 ? `${child.slice(0, 2_000)}…` : child;
    else output[key] = sanitizeContext(child);
  }
  return output;
}
