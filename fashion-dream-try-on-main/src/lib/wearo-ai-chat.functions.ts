import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";\nimport { resolveCustomerContext } from "@/lib/customer-context.server";

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

async function verifyStylistEntitlement(accessToken: string) {\n  const context = await resolveCustomerContext(accessToken);\n  if (context.kind === "guest") throw new Error("MEMBER_REQUIRED");\n  return context;\n}
