import { createFileRoute } from "@tanstack/react-router";
import { createTryOnJob, getTryOnResult, processTryOnJob } from "@/lib/ai-jobs.server";

function authorized(request: Request) {
  const expected = process.env.SUPABASE_SECRET_KEY?.trim();
  const actual = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return Boolean(expected && actual && actual === expected);
}

function clientKey(request: Request, fallback?: string) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? fallback
    ?? "unknown";
}

export const Route = createFileRoute("/api/try-on/internal/jobs/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
        try {
          const body = (await request.json()) as {
            person_image?: unknown;
            garment_image_url?: unknown;
            category?: unknown;
            note?: unknown;
            client_key?: unknown;
          };
          if (typeof body.person_image !== "string" || typeof body.garment_image_url !== "string" || typeof body.category !== "string") {
            return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
          }
          const key = clientKey(request, typeof body.client_key === "string" ? body.client_key : undefined);
          const created = await createTryOnJob({
            personImage: body.person_image,
            garmentImageUrl: body.garment_image_url,
            category: body.category,
            note: typeof body.note === "string" ? body.note : undefined,
            clientKey: key,
          });
          const processed = await processTryOnJob(created.job, {
            personImage: created.personImage,
            garmentImageUrl: created.garmentImageUrl,
            note: created.note,
            clientKey: key,
          });
          const result = processed.status === "completed" ? await getTryOnResult(processed.id, key) : processed;
          return Response.json({
            id: processed.id,
            status: processed.status,
            provider: processed.provider,
            result_image_url: result && "result_image_url" in result ? result.result_image_url : null,
            error: processed.error,
          });
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : "AI_JOB_FAILED" }, { status: 500 });
        }
      },
    },
  },
});
