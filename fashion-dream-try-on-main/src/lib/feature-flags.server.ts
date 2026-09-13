import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@vercel/flags-core";

const AI_TRY_ON_FLAG = "ai_try_on";

export async function isAiTryOnEnabled() {
  const sdkKey = process.env.FLAGS;

  // Fail closed when Vercel Flags is not configured locally or in a deployment.
  if (!sdkKey) return false;

  const client = createClient(sdkKey, {
    stream: false,
    polling: false,
  });

  await client.initialize();
  const result = await client.evaluate<boolean>(AI_TRY_ON_FLAG, false);

  return result.value;
}

export const getAiTryOnEnabled = createServerFn({ method: "GET" }).handler(async () => {
  return isAiTryOnEnabled();
});
