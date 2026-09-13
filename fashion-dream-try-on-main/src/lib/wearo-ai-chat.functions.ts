import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const ChatMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(12000),
});

const ChatInput = z.object({
  messages: z.array(ChatMessage).max(40),
});

const SYSTEM_PROMPT = [
  "You are WEARO AI Stylist, the fashion assistant for WEARO.",
  "Core message: Mặc theo cách của riêng bạn.",
  "Help users discover outfits, refine personal style, and make practical fashion decisions.",
  "Be concise, specific, modern, and fashion-editorial rather than generic.",
  "Do not invent real catalogue products, prices, stock, orders, or customer data.",
  "If the user needs a real product recommendation, tell them that catalogue search will be connected in the next layer rather than fabricating a product.",
].join("\n");

export const generateWearoAiReply = createServerFn({ method: "POST" })
  .validator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const result = await generateText({
      model: "openai/gpt-5.6-luna",
      system: SYSTEM_PROMPT,
      messages: data.messages,
    });

    return { text: result.text };
  });
