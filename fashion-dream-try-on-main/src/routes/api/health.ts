import { createFileRoute } from "@tanstack/react-router";
import { supabaseRequest } from "@/lib/supabase.server";
import {
  REQUEST_ID_HEADER,
  createRequestId,
  logServerEvent,
  safeLogError,
} from "@/lib/server-reliability";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestId = request.headers.get(REQUEST_ID_HEADER)?.trim() || createRequestId();
        const startedAt = Date.now();

        try {
          await supabaseRequest<Array<{ id: string }>>(
            "products?select=id&limit=1",
            { method: "GET", headers: { [REQUEST_ID_HEADER]: requestId } },
          );

          const body = {
            ok: true,
            status: "healthy",
            services: {
              api: "up",
              database: "up",
            },
            timestamp: new Date().toISOString(),
            requestId,
          } as const;

          logServerEvent("info", "health.check.completed", {
            requestId,
            status: 200,
            durationMs: Date.now() - startedAt,
          });

          return Response.json(body, {
            status: 200,
            headers: { [REQUEST_ID_HEADER]: requestId, "cache-control": "no-store" },
          });
        } catch (error) {
          logServerEvent("error", "health.check.failed", {
            requestId,
            status: 503,
            durationMs: Date.now() - startedAt,
            error: safeLogError(error),
          });

          return Response.json(
            {
              ok: false,
              status: "degraded",
              services: { api: "up", database: "down" },
              timestamp: new Date().toISOString(),
              requestId,
            },
            {
              status: 503,
              headers: { [REQUEST_ID_HEADER]: requestId, "cache-control": "no-store" },
            },
          );
        }
      },
    },
  },
});
