import { createServerFn } from "@tanstack/react-start";
import { generateImage } from "ai";
import { z } from "zod";

const CONCEPT_IMAGE_MODEL = "openai/gpt-image-2.5-flare";
const TRY_ON_IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";
const MAX_PERSON_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_NOTE_LENGTH = 400;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type GeneratedImage = { image: string; text: string };
type DbProduct = { id: string; name: string; category: string; price: number; image: string | null; active: boolean; status: string };
type DbProductImage = { image_url: string; sort_order: number; is_primary: boolean };
type DbVariant = { size: string; color: string; stock: number };

type ImageModel = typeof CONCEPT_IMAGE_MODEL | typeof TRY_ON_IMAGE_MODEL;

async function generateFashionImage(model: ImageModel, prompt: string, images: string[] = []): Promise<GeneratedImage> {
  try {
    const result = await generateImage({ model, prompt, images: images.length > 0 ? images : undefined, n: 1 });
    const image = result.image;
    if (!image) throw new Error("AI không trả về hình ảnh.");
    return { image: `data:${image.mediaType};base64,${image.base64}`, text: "" };
  } catch (error) {
    console.error("AI image generation error:", error);
    if (error instanceof Error) throw new Error(`AI tạo ảnh thất bại: ${error.message}`);
    throw new Error("AI tạo ảnh thất bại. Vui lòng thử lại.");
  }
}

function validatePersonImage(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Ảnh phải là JPG, PNG hoặc WEBP hợp lệ.");
  const [, mimeType, base64] = match;
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) throw new Error("Định dạng ảnh chưa được hỗ trợ.");
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const byteLength = Math.floor((base64.length * 3) / 4) - padding;
  if (byteLength <= 0 || byteLength > MAX_PERSON_IMAGE_BYTES) throw new Error("Ảnh tối đa 6MB.");
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
      supabaseRequest<DbProductImage[]>(`product_images?product_id=eq.${encodeURIComponent(product.id)}&select=image_url,sort_order,is_primary&order=sort_order.asc&limit=20`),
      supabaseRequest<DbVariant[]>(`product_variants?product_id=eq.${encodeURIComponent(product.id)}&select=size,color,stock&order=size.asc,color.asc&limit=100`),
    ]);
    const image = images.find((item) => item.is_primary)?.image_url ?? images[0]?.image_url ?? product.image;
    const variant = variants.find((item) => item.stock > 0) ?? variants[0];
    return image && variant ? { id: product.id, name: product.name, category: product.category, price: product.price, image, defaultVariant: { size: variant.size, color: variant.color } } : null;
  }));
  return result.filter((product): product is NonNullable<typeof product> => Boolean(product));
});

const ConceptInput = z.object({ style: z.string().trim().min(1).max(40), occasion: z.string().trim().min(1).max(40), prompt: z.string().trim().max(600).optional(), mentions: z.array(z.string().trim().min(1).max(100)).max(8).optional() });

export const generateConcept = createServerFn({ method: "POST" }).validator((input: unknown) => ConceptInput.parse(input)).handler(async ({ data }) => {
  const mentioned = data.mentions?.length ? await Promise.all(data.mentions.map((id) => getPublishedProduct(id))) : [];
  const items = mentioned.map(({ product }) => `${product.name} (${product.category})`).join(" | ");
  const prompt = ["Create a premium full-body fashion editorial photograph for the WEARO fashion brand.", "The image is an original fashion concept, not a product listing.", `Style: ${data.style}.`, `Occasion: ${data.occasion}.`, items ? `The outfit MUST feature these published WEARO clothing pieces: ${items}.` : "", data.prompt ? `Additional creative direction: ${data.prompt}.` : "", "Modern unisex fashion aesthetic.", "WEARO design language: charcoal-black, warm ivory, golden yellow and orange accents.", "Vietnamese urban context.", "Natural editorial lighting.", "35mm fashion photography.", "Realistic fabric texture, stitching and garment construction.", "Sharp subject detail with a refined fashion-magazine composition.", "No text.", "No watermark."].filter(Boolean).join(" ");
  return generateFashionImage(CONCEPT_IMAGE_MODEL, prompt);
});

const TryOnInput = z.object({ personImage: z.string().min(20).max(8_500_000), productId: z.string().trim().min(1).max(100).optional(), garmentImage: z.string().min(5).max(2_000_000).optional(), garmentName: z.string().trim().min(1).max(200).optional(), note: z.string().trim().max(MAX_NOTE_LENGTH).optional() }).refine((data) => Boolean(data.productId || data.garmentName), { message: "Thiếu sản phẩm thử đồ." });

export const generateTryOn = createServerFn({ method: "POST" }).validator((input: unknown) => TryOnInput.parse(input)).handler(async ({ data }) => {
  validatePersonImage(data.personImage);
  const { product, garmentImage } = await getPublishedProduct(data.productId, data.garmentName);
  const prompt = [
    "Perform a high-fidelity virtual try-on edit for WEARO.",
    "REFERENCE IMAGE 1 is the customer photo. REFERENCE IMAGE 2 is the selected garment/product photo.",
    `Dress the person in reference image 1 with the garment \"${product.name}\" shown in reference image 2.`,
    "Treat the garment image as the authoritative source for design, silhouette, color, material, pattern, seams, trims, logos and construction details.",
    "Preserve the person's identity, facial features, skin tone, body proportions, pose, hands, hairstyle and natural anatomy.",
    "Replace only the clothing area required for the selected garment; do not redesign the person's body or face.",
    "Adapt the garment naturally to the person's pose and body shape while preserving the original garment construction.",
    "Create realistic fabric folds, tension, shadows, occlusion and lighting consistent with the customer photograph.",
    "Preserve the original background, camera perspective and overall composition unless a clothing edit requires a minimal local adjustment.",
    "Do not add accessories or garments that are not present in the selected product.",
    data.note ? `Additional customer request: ${data.note}.` : "",
    "Photorealistic fashion-commerce result.",
    "No text. No watermark. No invented brand marks.",
  ].filter(Boolean).join(" ");
  return generateFashionImage(TRY_ON_IMAGE_MODEL, prompt, [data.personImage, garmentImage]);
});
