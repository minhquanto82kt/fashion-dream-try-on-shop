import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function safeEqual(a: string, b: string) {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

async function hmacSha256(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getSupabaseAdminKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw) as Record<string, string>;
      if (keys.default) return keys.default;
    } catch {
      // Fall back to the standard service-role variable below.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAdminKey = getSupabaseAdminKey();
const supabaseAdmin =
  supabaseUrl && supabaseAdminKey
    ? createClient(supabaseUrl, supabaseAdminKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, 405);
  }

  const body = await req.text();
  if (!body) return json({ success: false, message: "Empty body" }, 400);

  const webhookSecret = Deno.env.get("SEPAY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return json({ success: false, message: "Webhook secret is not configured" }, 503);
  }
  if (!supabaseAdmin) {
    return json(
      { success: false, message: "Supabase admin client is not configured" },
      503,
    );
  }

  const signature = req.headers.get("x-sepay-signature") ?? "";
  const timestamp = Number(req.headers.get("x-sepay-timestamp") ?? 0);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return json({ success: false, message: "Request expired" }, 401);
  }

  const expected = `sha256=${await hmacSha256(
    webhookSecret,
    `${timestamp}.${body}`,
  )}`;
  if (!safeEqual(expected, signature)) {
    return json({ success: false, message: "Invalid signature" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return json({ success: false, message: "Invalid JSON" }, 400);
  }

  const eventId = payload.id == null ? "" : String(payload.id);
  const orderCode =
    typeof payload.code === "string" ? payload.code.trim() : "";
  const transferType =
    typeof payload.transferType === "string" ? payload.transferType : "";
  const amount = Number(payload.transferAmount ?? 0);
  const accountNumber =
    typeof payload.accountNumber === "string"
      ? payload.accountNumber.trim()
      : "";
  const referenceCode =
    typeof payload.referenceCode === "string"
      ? payload.referenceCode.trim()
      : "";

  if (
    !eventId ||
    !orderCode ||
    transferType !== "in" ||
    !Number.isInteger(amount) ||
    amount <= 0
  ) {
    return json(
      { success: false, message: "Invalid SePay payment payload" },
      400,
    );
  }

  const configuredAccount = Deno.env
    .get("SEPAY_ACCOUNT_NUMBER")
    ?.trim();
  if (
    configuredAccount &&
    accountNumber &&
    configuredAccount !== accountNumber
  ) {
    return json(
      { success: false, message: "Unexpected destination account" },
      409,
    );
  }

  const { data: existingEvent, error: existingError } = await supabaseAdmin
    .from("payment_events")
    .select("id")
    .eq("provider", "sepay")
    .eq("provider_event_id", eventId)
    .maybeSingle();
  if (existingError) {
    console.error("Idempotency lookup failed", existingError);
    return json(
      { success: false, message: "Idempotency lookup failed" },
      500,
    );
  }
  if (existingEvent) return json({ success: true });

  const { data: payment, error: paymentError } = await supabaseAdmin
    .rpc("find_sepay_payment", {
      p_order_code: orderCode,
      p_provider_event_id: eventId,
    })
    .maybeSingle();
  if (paymentError) {
    console.error("Payment lookup failed", paymentError);
    return json({ success: false, message: "Payment lookup failed" }, 500);
  }
  if (!payment) {
    return json({ success: false, message: "Payment not found" }, 404);
  }
  if (payment.status !== "pending") return json({ success: true });
  if (Number(payment.amount) !== amount) {
    return json({ success: false, message: "Amount mismatch" }, 409);
  }

  const metadata = {
    provider: "sepay",
    provider_event_id: eventId,
    gateway: payload.gateway ?? null,
    transaction_date: payload.transactionDate ?? null,
    account_number: accountNumber || null,
    content: payload.content ?? null,
    description: payload.description ?? null,
    accumulated: payload.accumulated ?? null,
    raw_reference_code: referenceCode || null,
  };

  const { error: verifyError } = await supabaseAdmin.rpc(
    "verify_payment_status",
    {
      p_payment_id: payment.payment_id,
      p_new_status: "paid",
      p_transaction_ref: referenceCode || null,
      p_provider_transaction_id: eventId,
      p_failure_reason: null,
      p_metadata: metadata,
    },
  );

  if (verifyError) {
    console.error("Payment verification failed", verifyError);
    if (verifyError.message?.includes("Invalid payment state transition")) {
      return json({ success: false, message: verifyError.message }, 409);
    }
    return json(
      { success: false, message: "Payment verification failed" },
      500,
    );
  }

  return json({ success: true });
});
