import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getRequestId } from "./lib/http.server";
import { logRequest, logServerError } from "./lib/observability.server";

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
  headers.set("x-request-id", requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response, requestId: string): Promise<Response> {
  if (response.status < 500) return withRequestId(response, requestId);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return withRequestId(response, requestId);

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return withRequestId(response, requestId);

  logServerError("ssr.unhandled", consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`), {
    requestId,
  });
  return withRequestId(new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  }), requestId);
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
    const requestId = getRequestId(request);
    const startedAt = performance.now();

    try {
      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const response = await normalizeCatastrophicSsrResponse(rawResponse, requestId);
      logRequest({ requestId, request, response, durationMs: performance.now() - startedAt });
      return response;
    } catch (error) {
      logServerError("ssr.request_failed", error, { requestId });
      const response = withRequestId(new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }), requestId);
      logRequest({ requestId, request, response, durationMs: performance.now() - startedAt });
      return response;
    }
  },
};
