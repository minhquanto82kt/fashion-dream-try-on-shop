import { createFileRoute } from "@tanstack/react-router";

type SepayWebhookPayload = {
  id?: number | string;
  code?: string | null;
  content?: string | null;
  transferType?: string | null;
  transferAmount?: number | string | null;
  referenceCode?: string | null;
  transactionDate?: string | null;
  accountNumber?: string | null;
  subAccount?: string | null;
  bankCode?: string | null;
  description?: string | null;
  [key: string]: unknown;
};

type ProcessPaymentResult = {
  payment_id?: string;
  status?: string;
  [key: string]: unknown;
};

function getWebhookSecret(): string {
  const secret = process.env.SEPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Thiếu cấu hình SEPAY_WEBHOOK_SECRET trên server.");
  }

  return secret;
}

function getHeader(request: Request, name: string): string | null {
  return request.headers.get(name);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

async function parseJsonBody(request: Request): Promise<SepayWebhookPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Response("Unsupported Media Type", { status: 415 });
  }

  const body = (await request.json()) as unknown;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Response("Invalid JSON payload", { status: 400 });
  }

  return body as SepayWebhookPayload;
}

function normalizePositiveInteger(value: unknown): number | null {
  const amount = typeof value === "number"
    ? value
    : typeof value === "string"
      ? Number(value.replace(/[,.\s]/g, ""))
      : NaN;

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized || null;
}

function extractOrderCode(payload: SepayWebhookPayload): string | null {
  const candidates = [
    payload.code,
    payload.content,
    payload.description,
  ];

  for (const candidate of candidates) {
    const text = normalizeText(candidate);
    if (!text) continue;

    const match = text.match(/\bFD-\d{8}-[A-Z0-9]{5}\b/i);
    if (match) return match[0].toUpperCase();
  }

  return null;
}

function extractProviderEventId(payload: SepayWebhookPayload): string | null {
  const id = normalizeText(String(payload.id ?? ""));
  return id;
}

function extractProviderTransactionId(payload: SepayWebhookPayload): string | null {
  const reference = normalizeText(payload.referenceCode);
  return reference;
}

function extractTransactionRef(payload: SepayWebhookPayload): string | null {
  return normalizeText(payload.content)
    ?? normalizeText(payload.code)
    ?? normalizeText(payload.description);
}

async function callSupabaseRpc<T>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Thiếu cấu hình Supabase trên server.");
  }

  const response = await fetch(
    `${url}/rest/v1/rpc/${functionName}`,
    {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Supabase RPC ${functionName} failed (${response.status}): ${message}`,
    );
  }

  return response.json() as Promise<T>;
}

export const Route = createFileRoute("/api/sepay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const expectedSecret = getWebhookSecret();

          // SePay webhook authentication:
          // Prefer the Authorization header configured on the SePay webhook.
          // Accepted forms:
          //   Authorization: Apikey <secret>
          //   Authorization: Bearer <secret>
          //   X-Webhook-Secret: <secret>
          const authorization = getHeader(request, "authorization");
          const suppliedSecretHeader = getHeader(request, "x-webhook-secret");

          let suppliedSecret: string | null = null;

          if (authorization) {
            const match = authorization.match(/^(?:Apikey|Bearer)\s+(.+)$/i);
            suppliedSecret = match?.[1]?.trim() ?? null;
          }

          if (!suppliedSecret && suppliedSecretHeader) {
            suppliedSecret = suppliedSecretHeader.trim();
          }

          if (
            !suppliedSecret ||
            !constantTimeEqual(suppliedSecret, expectedSecret)
          ) {
            return Response.json(
              { success: false, error: "Unauthorized" },
              { status: 401 },
            );
          }

          const payload = await parseJsonBody(request);

          const transferType = normalizeText(payload.transferType)?.toLowerCase();
          if (transferType && transferType !== "in") {
            return Response.json({
              success: true,
              ignored: true,
              reason: "outgoing_transfer",
            });
          }

          const orderCode = extractOrderCode(payload);
          if (!orderCode) {
            return Response.json(
              {
                success: false,
                error: "ORDER_CODE_NOT_FOUND",
              },
              { status: 400 },
            );
          }

          const providerEventId = extractProviderEventId(payload);
          if (!providerEventId) {
            return Response.json(
              {
                success: false,
                error: "PROVIDER_EVENT_ID_NOT_FOUND",
              },
              { status: 400 },
            );
          }

          const transferAmount = normalizePositiveInteger(
            payload.transferAmount,
          );

          if (transferAmount === null) {
            return Response.json(
              {
                success: false,
                error: "INVALID_TRANSFER_AMOUNT",
              },
              { status: 400 },
            );
          }

          const providerTransactionId =
            extractProviderTransactionId(payload);
          const transactionRef = extractTransactionRef(payload);

          const metadata = {
            source: "sepay_webhook",
            provider_event_id: providerEventId,
            sepay_payload: payload,
            received_at: new Date().toISOString(),
          };

          const result = await callSupabaseRpc<ProcessPaymentResult>(
            "process_sepay_payment",
            {
              p_order_code: orderCode,
              p_provider_event_id: providerEventId,
              p_provider_transaction_id: providerTransactionId,
              p_transaction_ref: transactionRef,
              p_transfer_amount: transferAmount,
              p_transfer_type: transferType ?? "in",
              p_metadata: metadata,
            },
          );

          return Response.json({
            success: true,
            order_code: orderCode,
            payment: result,
          });
        } catch (error) {
          console.error("SePay webhook error:", error);

          if (error instanceof Response) {
            throw error;
          }

          return Response.json(
            {
              success: false,
              error: "PAYMENT_PROCESSING_FAILED",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
