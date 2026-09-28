import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const ChatMessage = z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(12000) });
const ChatInput = z.object({ accessToken: z.string().min(1), messages: z.array(ChatMessage).max(40) });

const SYSTEM_PROMPT = [
  "You are WEARO AI Stylist, the fashion assistant for WEARO.",
  "Core message: Mặc theo cách của riêng bạn.",
  "Help users discover outfits, refine personal style, and make practical fashion decisions.",
  "Be concise, specific, modern, and fashion-editorial rather than generic.",
  "Do not invent real catalogue products, prices, stock, orders, or customer data.",
  "If the user needs a real product recommendation, tell them that catalogue search will be connected in the next layer rather than fabricating a product.",
].join("\n");

async function verifyMember(accessToken: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Thiếu cấu hình Supabase trên server.");
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${accessToken.trim()}` } });
  if (!response.ok) throw new Error("MEMBER_REQUIRED");
  const user = (await response.json()) as { id?: string };
  if (!user.id) throw new Error("MEMBER_REQUIRED");
  return user.id;
}

export const generateWearoAiReply = createServerFn({ method: "POST" })
  .validator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    await verifyMember(data.accessToken);
    const result = await generateText({
      model: "openai/gpt-5.6-luna",
      system: SYSTEM_PROMPT,
      messages: data.messages,
    });
    return { text: result.text };
  });
