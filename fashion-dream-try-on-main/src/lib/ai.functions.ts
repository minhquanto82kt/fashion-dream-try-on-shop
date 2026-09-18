import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { generateImage } from "ai";
import { z } from "zod";
import { getAiTryOnEnabled } from "@/lib/feature-flags.server";

const CONCEPT_IMAGE_MODEL = "openai/gpt-image-2.5-flare";
const MAX_PERSON_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_NOTE_LENGTH = 400;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type GeneratedImage = { image: string; text: string };
type DbProduct = { id: string; name: string; category: string; price: number; image: string | null; active: boolean; status: string };
type DbProductImage = { image_url: string; sort_order: number; is_primary: boolean };
type DbVariant = { size: string; color: string; stock: number };

async function generateFashionImage(prompt: string, images: string[] = []): Promise<GeneratedImage> {
  try {
    const imagePrompt = images.length
      ? [
          { type: "text" as const, text: prompt },
          ...images.map((image) => ({ type: "image" as const, image })),
        ]
      : prompt;
    const result = await generateImage({
      model: CONCEPT_IMAGE_MODEL,
      prompt: imagePrompt,
      n: 1,
    });
    const image = result.image;
    if (!image) throw new Error("AI không trả về hình ảnh.");
    return { image: `data:${image.mediaType};base64,${image.base64}`, text: "" };
  } catch (error) {
    console.error("AI image generation error:", error);
    if (error instanceof Error) throw new Error(`AI tạo ảnh thất bại: ${error.message}`);
    throw new Error("AI tạo ảnh thất bại. Vui lòng thử lại.");
  }
}

async function getPublishedProduct(productId?: string, fallbackName?: string) {
  const { supabaseRequest } = await import("@/lib/supabase.server");
  const filter = productId ? `id=eq.${encodeURIComponent(productId)}` : `name=eq.${encodeURIComponent(fallbackName ?? "")}`;
  const products = await supabaseRequest<DbProduct[]>(`products?${filter}&active=eq.true&status=eq.published&select=id,name,category,price,image,active,status&limit=1`);
  const product = products[0];
  if (!product) throw new Error("Sản phẩm không tồn tại hoặc chưa được xuất bản.");
  const images = await supabaseRequest<DbProductImage[]>(`product_images?product_id=eq.${encodeURIComponent(product.id)}&select=image_url,sort_order,is_primary&order=sort_order.asc`);
  const garmentImage = images.find((image) => image.is_primary)?.image_url ?? images[0]?.image_url ?? product.image;
  if (!garmentImage) throw new Error("Sản phẩm chưa có hình ảnh để thử đồ.");
  return { product, garmentImage };
}

export const listAiProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseRequest } = await import("@/lib/supabase.server");
  const products = await supabaseRequest<DbProduct[]>("products?active=eq.true&status=eq.published&select=id,name,category,price,image&order=created_at.desc");
  const result = await Promise.all(products.map(async (product) => {
    const [images, variants] = await Promise.all([
      supabaseRequest<DbProductImage[]>(`product_images?product_id=${encodeURIComponent(product.id)}&select=image_url,sort_order,is_primary&order=sort_order.asc&limit=20`),
      supabaseRequest<DbVariant[]>(`product_variants?product_id=${encodeURIComponent(product.id)}&select=size,color,stock&order=size.asc,color.asc&limit=100`),
    ]);
    const image = images.find((item) => item.is_primary)?.image_url ?? images[0]?.image_url ?? product.image;
    const availableVariants = variants.filter((item) => item.stock > 0);
    const defaultVariant = availableVariants[0] ?? variants[0];
    return image && defaultVariant
      ? {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image,
          defaultVariant: { size: defaultVariant.size, color: defaultVariant.color },
          variants,
        }
      : null;
  }));
  return result.filter((product): product is NonNullable<typeof product> => Boolean(product));
});

const ConceptInput = z.object({
  style: z.string().trim().min(1).max(40),
  occasion: z.string().trim().min(1).max(40),
  prompt: z.string().trim().max(600).optional(),
  mentions: z.array(z.string().trim().min(1).max(100)).max(8).optional(),
});

export const generateConcept = createServerFn({ method: "POST" })
  .validator((input: unknown) => ConceptInput.parse(input))
  .handler(async ({ data }) => {
    const mentioned = data.mentions?.length ? await Promise.all(data.mentions.map((id) => getPublishedProduct(id))) : [];
    const items = mentioned.map(({ product }) => `${product.name} (${product.category})`).join(" | ");
    const prompt = [
      "Create a premium full-body fashion editorial photograph for the WEARO fashion brand.",
      "The image is an original fashion concept, not a product listing.",
      `Style: ${data.style}.`,
      `Occasion: ${data.occasion}.`,
      items ? `The outfit MUST feature these published WEARO clothing pieces: ${items}.` : "",
      data.prompt ? `Additional creative direction: ${data.prompt}.` : "",
      "Modern unisex fashion aesthetic.",
      "WEARO design language: charcoal-black, warm ivory, golden yellow and orange accents.",
      "Vietnamese urban context.",
      "Natural editorial lighting.",
      "35mm fashion photography.",
      "Realistic fabric texture, stitching and garment construction.",
      "Sharp subject detail with a refined fashion-magazine composition.",
      "No text.",
      "No watermark.",
    ].filter(Boolean).join(" ");
    return generateFashionImage(prompt);
  });

const TryOnInput = z.object({
  personImage: z.string().min(20).max(8_500_000),
  productId: z.string().trim().min(1).max(100).optional(),
  garmentImage: z.string().min(5).max(2_000_000).optional(),
  garmentName: z.string().trim().min(1).max(200).optional(),
  note: z.string().trim().max(MAX_NOTE_LENGTH).optional(),
}).refine((data) => Boolean(data.productId || data.garmentName), { message: "Thiếu sản phẩm thử đồ." });

function mapTryOnCategory(category: string): "top" | "bottom" | "dress" | "outerwear" | "full_body" {
  const normalized = category.trim().toLowerCase();
  if (normalized.includes("bottom") || normalized.includes("quần") || normalized.includes("pants") || normalized.includes("short")) return "bottom";
  if (normalized.includes("dress") || normalized.includes("váy") || normalized.includes("đầm")) return "dress";
  if (normalized.includes("outer") || normalized.includes("jacket") || normalized.includes("áo khoác") || normalized.includes("coat")) return "outerwear";
  if (normalized.includes("full") || normalized.includes("set") || normalized.includes("outfit")) return "full_body";
  return "top";
}

function serverOrigin(): string {
  const host = getRequestHeader("x-forwarded-host") ?? getRequestHeader("host");
  const forwardedProto = getRequestHeader("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host) return `${forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http")}://${host}`;
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://127.0.0.1:3000";
}

function internalSecret(): string {
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!secret) throw new Error("Thiếu cấu hình server cho AI Try-On.");
  return secret;
}

async function internalTryOnRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${serverOrigin()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${internalSecret()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
  if (!response.ok) {
    const detail = typeof payload === "object" && payload && "detail" in payload ? String(payload.detail) : text;
    throw new Error(detail || `AI Try-On backend failed (${response.status})`);
  }
  return payload as T;
}

type InternalTryOnJob = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  provider: string;
  result_image_url?: string | null;
  error?: string | null;
};

export const generateTryOn = createServerFn({ method: "POST" })
  .validator((input: unknown) => TryOnInput.parse(input))
  .handler(async ({ data }) => {
    const enabled = await getAiTryOnEnabled();
    if (!enabled) throw new Error("AI Virtual Try-On hiện đang tạm tắt. Vui lòng thử lại sau.");

    validatePersonImage(data.personImage);
    const { product, garmentImage } = await getPublishedProduct(data.productId, data.garmentName);
    const clientKey = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? getRequestHeader("x-real-ip") ?? "unknown";

    let job = await internalTryOnRequest<InternalTryOnJob>("/api/try-on/internal/jobs", {
      method: "POST",
      body: JSON.stringify({
        person_image: data.personImage,
        garment_image_url: garmentImage,
        category: mapTryOnCategory(product.category),
        note: data.note,
        client_key: clientKey,
      }),
    });

    for (let attempt = 0; attempt < 45; attempt += 1) {
      if (job.status === "completed") {
        if (!job.result_image_url) throw new Error("AI hoàn tất nhưng không trả về ảnh kết quả.");
        return { image: job.result_image_url, text: "" } satisfies GeneratedImage;
      }
      if (job.status === "failed") throw new Error(job.error || "AI Try-On thất bại. Vui lòng thử lại.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      job = await internalTryOnRequest<InternalTryOnJob>(`/api/try-on/internal/jobs/${encodeURIComponent(job.id)}`, { method: "GET" });
    }

    throw new Error("AI đang xử lý lâu hơn dự kiến. Vui lòng thử lại sau ít phút.");
  });

function validatePersonImage(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Ảnh phải là JPG, PNG hoặc WEBP hợp lệ.");
  const [, mimeType, base64] = match;
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) throw new Error("Định dạng ảnh chưa được hỗ trợ.");
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const byteLength = Math.floor((base64.length * 3) / 4) - padding;
  if (byteLength <= 0 || byteLength > MAX_PERSON_IMAGE_BYTES) throw new Error("Ảnh tối đa 6MB.");
}
