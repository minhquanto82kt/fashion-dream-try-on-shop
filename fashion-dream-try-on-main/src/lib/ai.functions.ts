import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PRODUCTS } from "@/data/products";


const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

type Content =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

async function generateImage(content: Content[]) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Thiếu cấu hình AI (LOVABLE_API_KEY).");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      modalities: ["image", "text"],
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("AI đang quá tải, vui lòng thử lại sau ít phút.");
    if (res.status === 402) throw new Error("Đã hết credit AI. Vui lòng nạp thêm trong Lovable.");
    const detail = await res.text();
    throw new Error(`AI lỗi (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string; images?: { image_url?: { url?: string } }[] } }[];
  };
  const message = data.choices?.[0]?.message;
  const image = message?.images?.[0]?.image_url?.url;
  if (!image) throw new Error("AI không trả về hình ảnh. Hãy thử mô tả khác.");
  return { image, text: message?.content ?? "" };
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
      .map((p) => `${p.name} (${p.category}, màu ${p.colors.join("/")}): ${p.description}`)
      .join(" | ");

    const prompt = [
      "Full-body fashion editorial photograph of a young Vietnamese university student model,",
      `styled in a ${data.style} outfit for the occasion: ${data.occasion}.`,
      items ? `The outfit MUST feature these UpThink pieces: ${items}.` : "",
      data.prompt ? `Additional direction: ${data.prompt}.` : "",
      "Streetwear brand aesthetic: charcoal and ivory palette with a lime-green accent, urban concrete backdrop,",
      "natural daylight, 35mm lens, sharp detail, no text or watermark.",
    ]
      .filter(Boolean)
      .join(" ");

    return generateImage([{ type: "text", text: prompt }]);
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
    const instruction = [
      `Virtual try-on: dress the person in the first image with the garment "${data.garmentName}" shown in the second image.`,
      "Keep the person's face, body proportions, pose, skin tone and background exactly the same.",
      "Fit the garment naturally with realistic folds, shadows and lighting.",
      data.note ? `Extra request: ${data.note}.` : "",
      "Photorealistic result, no text or watermark.",
    ]
      .filter(Boolean)
      .join(" ");

    return generateImage([
      { type: "text", text: instruction },
      { type: "image_url", image_url: { url: data.personImage } },
      { type: "image_url", image_url: { url: data.garmentImage } },
    ]);
  });
