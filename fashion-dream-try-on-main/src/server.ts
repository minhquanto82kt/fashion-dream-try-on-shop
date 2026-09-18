import "./lib/error-capture";

import { consumeLastCapturedError, describeError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applySecurityHeaders } from "./lib/security-headers";
import {
  REQUEST_ID_HEADER,
  createRequestId,
  logServerEvent,
} from "./lib/server-reliability";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function withRequestId(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function hardenResponse(response: Response, requestId: string): Response {
  return applySecurityHeaders(withRequestId(response, requestId));
}

async function normalizeCatastrophicSsrResponse(
  response: Response,
  requestId: string,
): Promise<Response> {
  if (response.status < 500) return hardenResponse(response, requestId);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return hardenResponse(response, requestId);

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return hardenResponse(response, requestId);

  const captured = consumeLastCapturedError();
  logServerEvent("error", "ssr.request.swallowed_error", {
    requestId,
    status: response.status,
    error: captured instanceof Error ? describeError(captured) : body.slice(0, 500),
  });
  return hardenResponse(
    new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
    requestId,
  );
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const requestId = request.headers.get(REQUEST_ID_HEADER)?.trim() || createRequestId();
    const startedAt = Date.now();
    const method = request.method.toUpperCase();
    const pathname = new URL(request.url).pathname;

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const finalResponse = await normalizeCatastrophicSsrResponse(response, requestId);

      logServerEvent("info", "http.request.completed", {
        requestId,
        method,
        pathname,
        status: finalResponse.status,
        durationMs: Date.now() - startedAt,
      });
      return finalResponse;
    } catch (error) {
      logServerEvent("error", "http.request.failed", {
        requestId,
        method,
        pathname,
        status: 500,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? describeError(error) : String(error),
      });
      return hardenResponse(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        requestId,
      );
    }
  },
};
