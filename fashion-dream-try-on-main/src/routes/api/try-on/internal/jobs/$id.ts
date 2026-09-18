import { createFileRoute } from "@tanstack/react-router";
import { getTryOnResult } from "@/lib/ai-jobs.server";

function authorized(request: Request) {
  const expected = process.env.SUPABASE_SECRET_KEY?.trim();
  const actual = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return Boolean(expected && actual && actual === expected);
}

export const Route = createFileRoute("/api/try-on/internal/jobs/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (!authorized(request)) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
        try {
          const result = await getTryOnResult(params.id);
          if (!result) return Response.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
          return Response.json({
            id: result.id,
            status: result.status,
            provider: result.provider,
            result_image_url: "result_image_url" in result ? result.result_image_url : null,
            error: result.error,
          });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "AI_JOB_STATUS_FAILED" }, { status: 500 });
        }
      },
    },
  },
});
