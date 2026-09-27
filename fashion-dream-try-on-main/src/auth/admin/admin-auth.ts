import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type InviteResponse = { user?: { id?: string; email?: string }; message?: string; error?: string; msg?: string };

const InviteInput = z.object({
  email: z.string().trim().email(),
  accessToken: z.string().min(1),
  redirectTo: z.string().url().optional(),
});

function getServerSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Thiếu cấu hình Supabase server.");
  return { url, secretKey };
}

async function assertAdmin(url: string, secretKey: string, accessToken: string) {
  const response = await fetch(`${url}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error("Không thể xác minh quyền quản trị viên.");
  if (!Boolean(await response.json())) throw new Error("Bạn không có quyền mời tài khoản.");
}

/**
 * Server-only admin invite. The Supabase Invite user email template is used by
 * Auth; the service key never reaches the browser.
 */
export const inviteUser = createServerFn({ method: "POST" })
  .validator((input: unknown) => InviteInput.parse(input))
  .handler(async ({ data }) => {
    const { url, secretKey } = getServerSupabaseConfig();
    await assertAdmin(url, secretKey, data.accessToken);

    const endpoint = new URL(`${url}/auth/v1/admin/invite`);
    if (data.redirectTo) endpoint.searchParams.set("redirect_to", data.redirectTo);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: data.email }),
    });

    const text = await response.text();
    let payload: InviteResponse = {};
    try { payload = text ? (JSON.parse(text) as InviteResponse) : {}; } catch {}
    if (!response.ok) throw new Error(payload.message || payload.msg || payload.error || "Không thể gửi lời mời tài khoản.");
    return payload;
  });
