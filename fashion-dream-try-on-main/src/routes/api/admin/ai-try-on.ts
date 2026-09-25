import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_ENVIRONMENTS = new Set(["production", "preview", "development"]);

type FlagEnvironment = {
  active: boolean;
  pausedOutcome: { type: string; variantId: string };
  rules: unknown[];
  fallthrough: unknown;
  revision?: number;
  reuse?: unknown;
  targets?: unknown;
};

type VercelFlag = {
  variants?: Array<Record<string, unknown>>;
  environments?: Record<string, FlagEnvironment>;
};

function getBearerToken(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

async function requireAdmin(request: Request) {
  const accessToken = getBearerToken(request);
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!accessToken || !supabaseUrl || !supabaseSecret) {
    return false;
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseSecret,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) return false;

  const adminResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: supabaseSecret,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!adminResponse.ok) return false;

  return (await adminResponse.json()) === true;
}

function getVercelConfig() {
  const token = process.env.VERCEL_ACCESS_TOKEN?.trim();
  const projectId = process.env.VERCEL_PROJECT_ID?.trim() || "prj_2QsSBOXOPYdviKnFVkmDGQIW6tZT";
  const teamSlug = process.env.VERCEL_TEAM_SLUG?.trim() || "up-think";
  const flagSlug = process.env.VERCEL_FLAG_SLUG?.trim() || "ai_try_on";

  if (!token) {
    throw new Error("Thiếu VERCEL_ACCESS_TOKEN trên Vercel environment variables.");
  }

  return { token, projectId, teamSlug, flagSlug };
}

async function getFlag(config: ReturnType<typeof getVercelConfig>) {
  const { token, projectId, teamSlug, flagSlug } = config;
  const response = await fetch(
    `https://api.vercel.com/v1/projects/${projectId}/feature-flags/flags/${flagSlug}?slug=${encodeURIComponent(teamSlug)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vercel Flags GET ${response.status}: ${text}`);
  }

  return (await response.json()) as VercelFlag;
}

function findVariantId(flag: VercelFlag, enabled: boolean) {
  const variants = flag.variants ?? [];

  const byValue = variants.find((variant) => variant.value === enabled);
  if (typeof byValue?.id === "string") return byValue.id;

  const label = enabled ? "on" : "off";
  const byLabel = variants.find(
    (variant) =>
      typeof variant.label === "string" &&
      variant.label.trim().toLowerCase() === label,
  );
  if (typeof byLabel?.id === "string") return byLabel.id;

  throw new Error(`Không tìm thấy variant ${enabled ? "ON" : "OFF"} của feature flag.`);
}

async function updateFlag(
  config: ReturnType<typeof getVercelConfig>,
  environment: string,
  enabled: boolean,
) {
  const flag = await getFlag(config);
  const current = flag.environments?.[environment];

  if (!current) {
    throw new Error(`Vercel Flag chưa có environment ${environment}.`);
  }

  const pausedVariantId = findVariantId(flag, enabled);
  const nextEnvironment: FlagEnvironment = {
    ...current,
    active: enabled,
    pausedOutcome: {
      type: "variant",
      variantId: pausedVariantId,
    },
  };

  const { token, projectId, teamSlug, flagSlug } = config;
  const response = await fetch(
    `https://api.vercel.com/v1/projects/${projectId}/feature-flags/flags/${flagSlug}?slug=${encodeURIComponent(teamSlug)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Admin toggle ${flagSlug} ${environment}: ${enabled ? "ON" : "OFF"}`,
        environments: {
          [environment]: nextEnvironment,
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vercel Flags PATCH ${response.status}: ${text}`);
  }

  return { enabled };
}

export const Route = createFileRoute("/api/admin/ai-try-on")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          if (!(await requireAdmin(request))) {
            return Response.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
          }

          const environment =
            new URL(request.url).searchParams.get("environment") ?? "preview";

          if (!ALLOWED_ENVIRONMENTS.has(environment)) {
            return Response.json({ error: "INVALID_ENVIRONMENT" }, { status: 400 });
          }

          const config = getVercelConfig();
          const flag = await getFlag(config);
          const envConfig = flag.environments?.[environment];

          if (!envConfig) {
            return Response.json({ error: "ENVIRONMENT_NOT_FOUND" }, { status: 404 });
          }

          return Response.json({ enabled: envConfig.active });
        } catch (error) {
          console.error("AI Try-On flag GET error:", error);
          return Response.json(
            {
              error: error instanceof Error ? error.message : "FLAG_READ_FAILED",
            },
            { status: 500 },
          );
        }
      },
      PATCH: async ({ request }) => {
        try {
          if (!(await requireAdmin(request))) {
            return Response.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
          }

          const body = (await request.json()) as {
            environment?: unknown;
            enabled?: unknown;
          };
          const environment =
            typeof body.environment === "string" ? body.environment : "";
          const enabled = body.enabled;

          if (!ALLOWED_ENVIRONMENTS.has(environment)) {
            return Response.json({ error: "INVALID_ENVIRONMENT" }, { status: 400 });
          }

          if (typeof enabled !== "boolean") {
            return Response.json({ error: "INVALID_ENABLED_VALUE" }, { status: 400 });
          }

          const config = getVercelConfig();
          const result = await updateFlag(config, environment, enabled);

          return Response.json(result);
        } catch (error) {
          console.error("AI Try-On flag PATCH error:", error);
          return Response.json(
            {
              error: error instanceof Error ? error.message : "FLAG_UPDATE_FAILED",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
