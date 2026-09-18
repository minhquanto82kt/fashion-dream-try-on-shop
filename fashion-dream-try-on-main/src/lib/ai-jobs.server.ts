import { getAiImageProvider } from "@/lib/ai-provider.server";
import { supabaseRequest } from "@/lib/supabase.server";
import { fetchWithTimeoutAndRetry, safeLogError } from "@/lib/server-reliability";

const BUCKET = "ai-results";
const QUOTA_LIMIT = 10;
const JOB_TTL_HOURS = 24;

type TryOnJobRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  provider: string;
  attempts: number;
  max_attempts: number;
  result_image_path: string | null;
  error: string | null;
  provider_error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

function supabaseBase() {
  const url = process.env.SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) throw new Error("Thiếu cấu hình Supabase server.");
  return { url, secret };
}

async function hashClientKey(value: string) {
  const normalized = value.trim().slice(0, 500) || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function consumeQuota(clientKey: string) {
  return supabaseRequest<{ allowed: boolean; remaining: number; limit: number }>("rpc/consume_ai_quota", {
    method: "POST",
    body: JSON.stringify({ p_client_key: await hashClientKey(clientKey), p_limit: QUOTA_LIMIT }),
  });
}

async function recordUsage(clientKey: string, success: boolean) {
  await supabaseRequest<unknown>("rpc/record_ai_usage_result", {
    method: "POST",
    body: JSON.stringify({ p_client_key: await hashClientKey(clientKey), p_success: success }),
  });
}

async function storageRequest(path: string, init: RequestInit) {
  const { url, secret } = supabaseBase();
  return fetchWithTimeoutAndRetry(`${url}/storage/v1/${path}`, {
    ...init,
    headers: { apikey: secret, Authorization: `Bearer ${secret}`, ...(init.headers ?? {}) },
  }, { timeoutMs: 15_000, maxRetries: 1 });
}

async function uploadObject(path: string, bytes: Uint8Array, mediaType: string) {
  const response = await storageRequest(`object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { "Content-Type": mediaType, "x-upsert": "true" },
    body: bytes as unknown as BodyInit,
  });
  if (!response.ok) throw new Error(`AI storage failed (${response.status}).`);
}

async function createSignedUrl(path: string) {
  const response = await storageRequest(`object/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  if (!response.ok) throw new Error(`AI result signing failed (${response.status}).`);
  const payload = (await response.json()) as { signedURL?: string };
  if (!payload.signedURL) throw new Error("AI result signing returned no URL.");
  const { url } = supabaseBase();
  return payload.signedURL.startsWith("http") ? payload.signedURL : `${url}/storage/v1${payload.signedURL}`;
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function parseDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid input image data URL.");
  return { mediaType: match[1], bytes: base64ToBytes(match[2]) };
}

function extension(mediaType: string) {
  if (mediaType === "image/webp") return "webp";
  if (mediaType === "image/jpeg") return "jpg";
  return "png";
}

async function getJob(id: string) {
  const rows = await supabaseRequest<TryOnJobRow[]>(
    `try_on_jobs?id=eq.${encodeURIComponent(id)}&select=id,status,provider,attempts,max_attempts,result_image_path,error,provider_error,created_at,updated_at,completed_at&limit=1`,
  );
  return rows[0] ?? null;
}

async function updateJob(id: string, values: Record<string, unknown>) {
  await supabaseRequest(`try_on_jobs?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(values) });
}

async function claimJob(id: string, attempt: number) {
  const rows = await supabaseRequest<TryOnJobRow[]>(
    `try_on_jobs?id=eq.${encodeURIComponent(id)}&status=eq.queued&select=id,status,attempts,max_attempts,provider,result_image_path,error,provider_error,created_at,updated_at,completed_at&limit=1`,
    { method: "PATCH", body: JSON.stringify({ status: "processing", started_at: new Date().toISOString(), attempts: attempt }) },
  );
  return rows[0] ?? null;
}

function isExpired(job: TryOnJobRow) {
  return Date.now() - Date.parse(job.created_at) > JOB_TTL_HOURS * 60 * 60 * 1000;
}

export async function createTryOnJob(input: {
  personImage: string;
  garmentImageUrl: string;
  category: string;
  note?: string;
  clientKey: string;
}) {
  const quota = await consumeQuota(input.clientKey);
  if (!quota.allowed) throw new Error(`Bạn đã dùng hết ${quota.limit} lượt AI hôm nay. Vui lòng thử lại vào ngày mai.`);

  const rows = await supabaseRequest<TryOnJobRow[]>("try_on_jobs", {
    method: "POST",
    body: JSON.stringify({
      status: "queued",
      provider: "openai-gateway",
      category: input.category,
      person_image_path: "pending",
      garment_image_path: input.garmentImageUrl,
      metadata: { note: input.note ?? "", quota_remaining: quota.remaining },
      idempotency_key: crypto.randomUUID(),
      client_key: await hashClientKey(input.clientKey),
      max_attempts: 2,
      next_attempt_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + JOB_TTL_HOURS * 60 * 60 * 1000).toISOString(),
    }),
  });
  const job = rows[0];
  if (!job) throw new Error("Không thể tạo AI job.");

  const inputImage = parseDataUrl(input.personImage);
  const inputPath = `try-on-input/${job.id}.${extension(inputImage.mediaType)}`;
  try {
    await uploadObject(inputPath, inputImage.bytes, inputImage.mediaType);
    await updateJob(job.id, { person_image_path: inputPath });
  } catch (error) {
    await updateJob(job.id, { status: "failed", error: "INPUT_STORAGE_FAILED", provider_error: safeLogError(error), completed_at: new Date().toISOString() });
    await recordUsage(input.clientKey, false);
    throw new Error("Không thể lưu ảnh đầu vào AI. Vui lòng thử lại.");
  }

  return { job: { ...job, person_image_path: inputPath }, personImage: input.personImage, garmentImageUrl: input.garmentImageUrl, note: input.note };
}

export async function processTryOnJob(job: TryOnJobRow, input: { personImage: string; garmentImageUrl: string; note?: string; clientKey: string }) {
  if (job.status === "completed" || job.status === "failed") return job;
  if (isExpired(job)) {
    await updateJob(job.id, { status: "failed", error: "JOB_EXPIRED", provider_error: "AI job exceeded its lifetime.", completed_at: new Date().toISOString() });
    await recordUsage(input.clientKey, false);
    return (await getJob(job.id)) ?? job;
  }

  let current = job;
  for (let attempt = Math.max(1, job.attempts + 1); attempt <= job.max_attempts; attempt += 1) {
    const claimed = await claimJob(job.id, attempt);
    if (!claimed) return (await getJob(job.id)) ?? current;
    current = claimed;
    const started = Date.now();
    try {
      const provider = getAiImageProvider();
      const prompt = [
        "Perform a realistic virtual try-on edit for WEARO.",
        "Preserve the person's face, body proportions, pose, skin tone, hair and background as faithfully as possible.",
        "Replace or layer the clothing on the person with the supplied garment reference.",
        `Garment category: ${job.status === "processing" ? "fashion garment" : "fashion garment"}.`,
        input.note ? `Styling note: ${input.note}.` : "",
        "Preserve garment color, silhouette, fabric texture, stitching and construction.",
        "Natural photographic lighting, realistic shadows, no text, no watermark.",
      ].filter(Boolean).join(" ");
      const result = await provider.generateImage({ prompt, images: [input.personImage, input.garmentImageUrl] });
      const path = `try-on/${job.id}.${extension(result.mediaType)}`;
      await uploadObject(path, base64ToBytes(result.base64), result.mediaType);
      await updateJob(job.id, {
        status: "completed",
        provider: provider.name,
        result_image_path: path,
        completed_at: new Date().toISOString(),
        provider_error: null,
        error: null,
        metadata: { duration_ms: Date.now() - started },
      });
      await recordUsage(input.clientKey, true);
      return (await getJob(job.id)) ?? current;
    } catch (error) {
      const retryable = attempt < job.max_attempts;
      await updateJob(job.id, {
        status: retryable ? "queued" : "failed",
        attempts: attempt,
        next_attempt_at: retryable ? new Date(Date.now() + 1500).toISOString() : null,
        error: retryable ? "PROVIDER_RETRY" : "PROVIDER_FAILED",
        provider_error: safeLogError(error),
        completed_at: retryable ? null : new Date().toISOString(),
      });
      if (!retryable) await recordUsage(input.clientKey, false);
      if (retryable) await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  return (await getJob(job.id)) ?? current;
}

export async function getTryOnResult(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return null;
  if (job.status !== "completed" || !job.result_image_path) return job;
  return { ...job, result_image_url: await createSignedUrl(job.result_image_path) };
}
