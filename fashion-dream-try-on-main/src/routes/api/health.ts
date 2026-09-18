import { supabaseRequest } from "@/lib/supabase.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestId = request.headers.get("x-request-id") ?? undefined;
        const startedAt = performance.now();

        try {
          await supabaseRequest<Array<{ id: string }>>("products?select=id&limit=1", {
            method: "GET",
          });

          return Response.json({
            status: "ok",
            database: "ok",
            service: "wearo-web",
            durationMs: Math.round(performance.now() - startedAt),
            requestId,
          });
        } catch {
          return Response.json({
            status: "degraded",
            database: "unavailable",
            service: "wearo-web",
            durationMs: Math.round(performance.now() - startedAt),
            requestId,
          }, { status: 503 });
        }
      },
    },
  },
});
