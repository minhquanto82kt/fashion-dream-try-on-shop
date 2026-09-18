import { generateImage } from "ai";

export type AiImageInput = {
  prompt: string;
  images?: string[];
};

export type AiImageOutput = {
  base64: string;
  mediaType: string;
};

export type AiProvider = {
  name: string;
  generateImage(input: AiImageInput): Promise<AiImageOutput>;
};

const OPENAI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL?.trim() || "openai/gpt-image-2.5-flare";
const MAX_PROVIDER_ATTEMPTS = 2;

function isRetryable(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return /timeout|timed out|429|rate.?limit|502|503|504|temporar|network|fetch failed/.test(message);
}

const openAiGatewayProvider: AiProvider = {
  name: "openai-gateway",
  async generateImage(input) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt += 1) {
      try {
        const prompt = input.images?.length ? { text: input.prompt, images: input.images } : input.prompt;
        const result = await generateImage({
          model: OPENAI_IMAGE_MODEL,
          prompt,
          n: 1,
        });
        const image = result.image;
        if (!image?.base64) throw new Error("AI provider returned no image.");
        return { base64: image.base64, mediaType: image.mediaType };
      } catch (error) {
        lastError = error;
        if (attempt >= MAX_PROVIDER_ATTEMPTS || !isRetryable(error)) break;
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("AI image provider failed.");
  },
};

export function getAiImageProvider(): AiProvider {
  const provider = process.env.AI_IMAGE_PROVIDER?.trim().toLowerCase() || "openai";
  if (provider === "openai" || provider === "openai-gateway") return openAiGatewayProvider;
  throw new Error(`Unsupported AI_IMAGE_PROVIDER: ${provider}`);
}
