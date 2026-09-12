import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "node:crypto";

 type MomoIpnPayload = {
  partnerCode?: unknown;
  requestId?: unknown;
  orderId?: unknown;
  amount?: unknown;
  orderInfo?: unknown;
  orderType?: unknown;
  transId?: unknown;
  resultCode?: unknown;
  message?: unknown;
  payType?: unknown;
  responseTime?: unknown;
  extraData?: unknown;
  signature?: unknown;
};

type ProcessPaymentResult = {
  id?: string;
  status?: string;
  [key: string]: unknown;
};

function getConfig() {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  if (!partnerCode || !accessKey || !secretKey) {
    throw new Error("Thiếu cấu hình MoMo server.");
  }

  return { partnerCode, accessKey, secretKey };
}

function text(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function positiveInteger(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function signIpn(
  accessKey: string,
  secretKey: string,
  payload: {
    amount: number;
    extraData: string;
    message: string;
    orderId: string;
    orderInfo: string;
    orderType: string;
    partnerCode: string;
    payType: string;
    requestId: string;
    responseTime: string;
    resultCode: number;
    transId: string;
  },
) {
  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData}`,
    `message=${payload.message}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `orderType=${payload.orderType}`,
    `partnerCode=${payload.partnerCode}`,
    `payType=${payload.payType}`,
    `requestId=${payload.requestId}`,
    `responseTime=${payload.responseTime}`,
    `resultCode=${payload.resultCode}`,
    `transId=${payload.transId}`,
  ].join("&");

  return createHmac("sha256", secretKey)
    .update(rawSignature, "utf8")
    .digest("hex");
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

  const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase RPC ${functionName} failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<T>;
}

async function parseJsonBody(request: Request): Promise<MomoIpnPayload> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Response("Unsupported Media Type", { status: 415 });
  }

  const body = (await request.json()) as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Response("Invalid JSON payload", { status: 400 });
  }

  return body as MomoIpnPayload;
}

export const Route = createFileRoute("/api/momo/ipn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const config = getConfig();
          const payload = await parseJsonBody(request);

          const partnerCode = text(payload.partnerCode);
          const requestId = text(payload.requestId).trim();
          const orderId = text(payload.orderId).trim();
          const orderInfo = text(payload.orderInfo);
          const orderType = text(payload.orderType);
          const transId = text(payload.transId).trim();
          const message = text(payload.message);
          const payType = text(payload.payType);
          const responseTime = text(payload.responseTime);
          const extraData = text(payload.extraData);
          const signature = text(payload.signature).trim().toLowerCase();
          const amount = positiveInteger(payload.amount);
          const resultCode = Number(payload.resultCode);

          if (
            !partnerCode ||
            !requestId ||
            !orderId ||
            !transId ||
            !amount ||
            !Number.isInteger(resultCode) ||
            !signature
          ) {
            return new Response(null, { status: 400 });
          }

          if (partnerCode !== config.partnerCode) {
            return new Response(null, { status: 401 });
          }

          const expectedSignature = signIpn(config.accessKey, config.secretKey, {
            amount,
            extraData,
            message,
            orderId,
            orderInfo,
            orderType,
            partnerCode,
            payType,
            requestId,
            responseTime,
            resultCode,
            transId,
          });

          if (!constantTimeEqual(signature, expectedSignature)) {
            return new Response(null, { status: 401 });
          }

          if (orderType !== "momo_wallet") {
            return new Response(null, { status: 400 });
          }

          const providerEventId = `momo:${requestId}:${transId}:${resultCode}`;

          await callSupabaseRpc<ProcessPaymentResult>("process_momo_payment", {
            p_order_code: orderId,
            p_provider_event_id: providerEventId,
            p_provider_transaction_id: transId,
            p_transaction_ref: transId,
            p_amount: amount,
            p_result_code: resultCode,
            p_metadata: {
              source: "momo_ipn",
              request_id: requestId,
              partner_code: partnerCode,
              order_type: orderType,
              pay_type: payType,
              response_time: responseTime,
              result_code: resultCode,
              message,
              extra_data: extraData,
              received_at: new Date().toISOString(),
            },
          });

          return new Response(null, { status: 204 });
        } catch (error) {
          console.error("MoMo IPN error:", error);

          if (error instanceof Response) throw error;
          return new Response(null, { status: 500 });
        }
      },
    },
  },
});
