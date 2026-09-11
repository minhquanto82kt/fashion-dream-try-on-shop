import { createServerFn } from "@tanstack/react-start";
import { generateImage } from "ai";
import { z } from "zod";

const IMAGE_MODEL = "openai/gpt-image-2";
const MAX_PERSON_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_NOTE_LENGTH = 400;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type GeneratedImage = {
  image: string;
  text: string;
};

type DbProduct = {
  id: string;
  name: string;
  category: string;
  image: string | null;
  active: boolean;
  status: string;
};

type DbProductImage = {
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

async function generateFashionImage(
  prompt: string,
  images: string[] = [],
): Promise<GeneratedImage> {
  try {
    const result = await generateImage({
      model: IMAGE_MODEL,
      prompt,
      images: images.length > 0 ? images : undefined,
      n: 1,
    });

    const image = result.image;

    if (!image) {
      throw new Error("AI không trả về hình ảnh.");
    }

    return {
      image: `data:${image.mediaType};base64,${image.base64}`,
      text: "",
    };
  } catch (error) {
    console.error("AI image generation error:", error);

    if (error instanceof Error) {
      throw new Error(`AI tạo ảnh thất bại: ${error.message}`);
    }

    throw new Error("AI tạo ảnh thất bại. Vui lòng thử lại.");
  }
}

function validatePersonImage(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);

  if (!match) {
    throw new Error("Ảnh phải là JPG, PNG hoặc WEBP hợp lệ.");
  }

  const [, mimeType, base64] = match;
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new Error("Định dạng ảnh chưa được hỗ trợ.");
  }

  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const byteLength = Math.floor((base64.length * 3) / 4) - padding;

  if (byteLength <= 0 || byteLength > MAX_PERSON_IMAGE_BYTES) {
    throw new Error("Ảnh tối đa 6MB.");
  }
}

async function getPublishedProduct(productId: string) {
  const { supabaseRequest } = await import("@/lib/supabase.server");

  const products = await supabaseRequest<DbProduct[]>(
    `products?id=eq.${encodeURIComponent(productId)}&active=eq.true&status=eq.published&select=id,name,category,image,active,status&limit=1`,
  );

  const product = products[0];
  if (!product) {
    throw new Error("Sản phẩm không tồn tại hoặc chưa được xuất bản.");
  }

  const images = await supabaseRequest<DbProductImage[]>(
    `product_images?product_id=eq.${encodeURIComponent(productId)}&select=image_url,sort_order,is_primary&order=sort_order.asc`,
  );

  const garmentImage =
    images.find((image) => image.is_primary)?.image_url ??
    images[0]?.image_url ??
    product.image;

  if (!garmentImage) {
    throw new Error("Sản phẩm chưa có hình ảnh để thử đồ.");
  }

  return { product, garmentImage };
}

const ConceptInput = z.object({
  style: z.string().trim().min(1).max(40),
  occasion: z.string().trim().min(1).max(40),
  prompt: z.string().trim().max(600).optional(),
  mentions: z.array(z.string().trim().min(1).max(100)).max(8).optional(),
});

export const generateConcept = createServerFn({ method: "POST" })
  .validator((input: unknown) => ConceptInput.parse(input))
  .handler(async ({ data }) => {
    const mentioned = data.mentions?.length
      ? await Promise.all(data.mentions.map((id) => getPublishedProduct(id)))
      : [];

    const items = mentioned
      .map(({ product }) => `${product.name} (${product.category})`)
      .join(" | ");

    const prompt = [
      "Create a full-body fashion editorial photograph of a young Vietnamese university student model.",
      `Style: ${data.style}.`,
      `Occasion: ${data.occasion}.`,
      items
        ? `The outfit MUST feature these UpThink clothing pieces: ${items}.`
        : "",
      data.prompt ? `Additional direction: ${data.prompt}.` : "",
      "Streetwear brand aesthetic.",
      "Charcoal and ivory palette with a lime-green accent.",
      "Urban concrete backdrop.",
      "Natural daylight.",
      "35mm photography.",
      "Sharp realistic detail.",
      "Photorealistic.",
      "No text.",
      "No watermark.",
    ]
      .filter(Boolean)
      .join(" ");

    return generateFashionImage(prompt);
  });

const TryOnInput = z.object({
  personImage: z.string().min(20).max(8_500_000),
  productId: z.string().trim().min(1).max(100),
  note: z.string().trim().max(MAX_NOTE_LENGTH).optional(),
});

export const generateTryOn = createServerFn({ method: "POST" })
  .validator((input: unknown) => TryOnInput.parse(input))
  .handler(async ({ data }) => {
    validatePersonImage(data.personImage);

    const { product, garmentImage } = await getPublishedProduct(data.productId);

    const prompt = [
      "Perform a realistic virtual try-on edit.",
      `Dress the person in the first reference image with the garment \"${product.name}\" from the second reference image.`,
      "Preserve the person's identity and facial features.",
      "Preserve body proportions, skin tone, pose and hairstyle.",
      "Keep the original background and camera composition.",
      "Replace only the clothing.",
      "Make the garment fit naturally according to the person's body shape.",
      "Preserve the garment's design, color, material, pattern, seams and important details.",
      "Add realistic fabric folds, shadows and lighting consistent with the original photograph.",
      "Do not change the person's face or body.",
      data.note ? `Additional request: ${data.note}.` : "",
      "Photorealistic result.",
      "No text.",
      "No watermark.",
    ]
      .filter(Boolean)
      .join(" ");

    return generateFashionImage(prompt, [data.personImage, garmentImage]);
  });
