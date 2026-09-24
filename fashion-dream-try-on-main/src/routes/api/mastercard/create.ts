import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

type Body = { orderCode?: unknown };

type OrderRow = {
  id: string;
  order_code: string;
  total: number;
  payment_method: string;
  payment_status: string;
};

type GatewayResponse = {
  result?: string;
  session?: { id?: string; updateStatus?: string };
  successIndicator?: string;
  error?: { explanation?: string; field?: string; validationType?: string };
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function getOrder(orderCode: string): Promise<OrderRow> {
  const url = requiredEnv("SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SECRET_KEY");
  const response = await fetch(
    `${url}/rest/v1/orders?select=id,order_code,total,payment_method,payment_status&order_code=eq.${encodeURIComponent(orderCode)}&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!response.ok) throw new Error("Không thể đọc đơn hàng.");
  const rows = (await response.json()) as OrderRow[];
  if (!rows[0]) throw new Error("Không tìm thấy đơn hàng.");
  return rows[0];
}

export const Route = createFileRoute("/api/mastercard/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
            return json({ success: false, error: "Unsupported Media Type" }, 415);
          }

          const body = (await request.json()) as Body;
          const orderCode = typeof body.orderCode === "string" ? body.orderCode.trim() : "";
          if (!orderCode) return json({ success: false, error: "ORDER_CODE_REQUIRED" }, 400);

          const order = await getOrder(orderCode);
          if (order.payment_method !== "mastercard") return json({ success: false, error: "INVALID_PAYMENT_METHOD" }, 409);
          if (order.payment_status === "paid") return json({ success: false, error: "ORDER_ALREADY_PAID" }, 409);

          const merchantId = requiredEnv("MASTERCARD_MERCHANT_ID");
          const apiPassword = requiredEnv("MASTERCARD_API_PASSWORD");
          const gatewayUrl = (process.env.MASTERCARD_GATEWAY_URL ?? "https://ap.gateway.mastercard.com").replace(/\/$/, "");
          const apiVersion = process.env.MASTERCARD_API_VERSION?.trim() || "100";
          const baseUrl = requiredEnv("PUBLIC_APP_URL").replace(/\/$/, "");

          const auth = Buffer.from(`merchant.${merchantId}:${apiPassword}`).toString("base64");
          const endpoint = `${gatewayUrl}/api/rest/version/${encodeURIComponent(apiVersion)}/merchant/${encodeURIComponent(merchantId)}/session`;
          const gatewayPayload = {
            apiOperation: "INITIATE_CHECKOUT",
            checkoutMode: "WEBSITE",
            interaction: {
              operation: "PURCHASE",
              returnUrl: `${baseUrl}/checkout/mastercard?order=${encodeURIComponent(order.order_code)}`,
              timeoutUrl: `${baseUrl}/checkout?payment=cancelled`,
              merchant: { name: "WEARO" },
              displayControl: { orderSummary: "READ_ONLY" },
            },
            order: {
              id: order.order_code,
              amount: Number(order.total).toFixed(0),
              currency: "VND",
              reference: order.order_code,
              description: `WEARO order ${order.order_code}`,
            },
          };

          const gatewayResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(gatewayPayload),
          });

          const payload = (await gatewayResponse.json().catch(() => ({}))) as GatewayResponse;
          if (!gatewayResponse.ok || payload.session?.updateStatus !== "SUCCESS" || !payload.session.id) {
            console.error("Mastercard Gateway initiation failed", { status: gatewayResponse.status, payload });
            return json({ success: false, error: payload.error?.explanation || "Không thể khởi tạo thanh toán Mastercard." }, 502);
          }

          return json({
            success: true,
            provider: "mastercard_gateway",
            merchantId,
            apiVersion,
            orderCode: order.order_code,
            amount: order.total,
            sessionId: payload.session.id,
            successIndicator: payload.successIndicator ?? null,
            checkoutScriptUrl: `${gatewayUrl}/static/checkout/checkout.min.js`,
          });
        } catch (error) {
          console.error("Mastercard create checkout error:", error);
          return json({ success: false, error: error instanceof Error ? error.message : "Không thể khởi tạo Mastercard." }, 500);
        }
      },
    },
  },
});
