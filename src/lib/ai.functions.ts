import { createServerFn } from "@tanstack/react-start";
import { generateImage } from "ai";
import { z } from "zod";
import { PRODUCTS } from "@/data/products";

const IMAGE_MODEL = "openai/gpt-image-2";

type GeneratedImage = {
  image: string;
  text: string;
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
    console.error("AI Gateway image generation error:", error);

    if (error instanceof Error) {
      throw new Error(`AI tạo ảnh thất bại: ${error.message}`);
    }

    throw new Error("AI tạo ảnh thất bại. Vui lòng thử lại.");
  }
}

const ConceptInput = z.object({
  style: z.string().min(1),
  occasion: z.string().min(1),
  prompt: z.string().max(600).optional(),
  mentions: z.array(z.string()).max(8).optional(),
});

export const generateConcept = createServerFn({ method: "POST" })
  .validator((input: unknown) => ConceptInput.parse(input))
  .handler(async ({ data }) => {
    const mentioned = (data.mentions ?? [])
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter(Boolean) as (typeof PRODUCTS)[number][];

    const items = mentioned
      .map((p) => `${p.name} (${p.category}, màu ${p.colors.join("/")})`)
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
  personImage: z.string().min(20),
  garmentImage: z.string().min(5),
  garmentName: z.string().min(1),
  note: z.string().max(400).optional(),
});

export const generateTryOn = createServerFn({ method: "POST" })
  .validator((input: unknown) => TryOnInput.parse(input))
  .handler(async ({ data }) => {
    const prompt = [
      "Perform a realistic virtual try-on edit.",
      `Dress the person in the first reference image with the garment "${data.garmentName}" shown in the second reference image.`,
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

    return generateFashionImage(prompt, [data.personImage, data.garmentImage]);
  });
