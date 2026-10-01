import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createAdminMockSession } from "@/lib/customer-context.server";

const Input = z.object({ adminAccessToken: z.string().trim().min(1).max(5000) });

export const startAdminMockSession = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => createAdminMockSession(data.adminAccessToken));
