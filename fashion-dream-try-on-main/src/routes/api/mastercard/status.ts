import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function getOrder(orderCode: string) {
  const url = requiredEnv("SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SECRET_KEY");
  const response = await fetch(`${url}/rest/v1/orders?select=id,order_code,total,payment_method,payment_status&order_code=eq.${encodeURIComponent(orderCode)}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error("Không thể đọc đơn hàng.");
  const rows = (await response.json()) as Array<{ id: string; order_code: string; total: number; payment_method: string; payment_status: string }>;
  return rows[0] ?? null;
}

async function verifyPayment(paymentId: string, transactionRef: string, providerTransactionId: string, metadata: Record<string, unknown>) {
  const url = requiredEnv("SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SECRET_KEY");
  const response = await fetch(`${url}/rest/v1/rpc/verify_payment_status`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_payment_id: paymentId, p_new_status: "paid", p_transaction_ref: transactionRef, p_provider_transaction_id: providerTransactionId, p_failure_reason: null, p_metadata: metadata }),
  });
  if (!response.ok) throw new Error(`Không thể xác nhận payment (${response.status}).`);
  return response.json();
}

export const Route = createFileRoute("/api/mastercard/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const requestUrl = new URL(request.url);
          const orderCode = requestUrl.searchParams.get("orderCode")?.trim() ?? "";
          if (!orderCode) return json({ success: false, error: "ORDER_CODE_REQUIRED" }, 400);

          const order = await getOrder(orderCode);
          if (!order) return json({ success: false, error: "ORDER_NOT_FOUND" }, 404);
          if (order.payment_method !== "mastercard") return json({ success: false, error: "INVALID_PAYMENT_METHOD" }, 409);
          if (order.payment_status === "paid") return json({ success: true, status: "paid", orderCode });

          const merchantId = requiredEnv("MASTERCARD_MERCHANT_ID");
          const apiPassword = requiredEnv("MASTERCARD_API_PASSWORD");
          const gatewayUrl = (process.env.MASTERCARD_GATEWAY_URL ?? "https://ap.gateway.mastercard.com").replace(/\/$/, "");
          const apiVersion = process.env.MASTERCARD_API_VERSION?.trim() || "100";
          const auth = Buffer.from(`merchant.${merchantId}:${apiPassword}`).toString("base64");
          const endpoint = `${gatewayUrl}/api/rest/version/${encodeURIComponent(apiVersion)}/merchant/${encodeURIComponent(merchantId)}/order/${encodeURIComponent(orderCode)}`;
          const response = await fetch(endpoint, { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" } });
          const gateway = (await response.json().catch(() => ({}))) as {
            result?: string;
            id?: string;
            amount?: string | number;
            currency?: string;
            transaction?: Array<{ id?: string; result?: string; type?: string; amount?: string | number; currency?: string; reference?: string; response?: { gatewayCode?: string } }>;
          };
          if (!response.ok) return json({ success: false, error: "MASTERCARD_STATUS_UNAVAILABLE" }, 502);

          const successful = (gateway.transaction ?? []).find((tx) => tx.result === "SUCCESS" && Number(tx.amount) === Number(order.total) && (tx.currency ?? "VND") === "VND");
          if (!successful?.id) return json({ success: true, status: "pending", orderCode });

          const paymentResponse = await fetch(`${requiredEnv("SUPABASE_URL")}/rest/v1/payments?select=id,status,amount&order_id=eq.${encodeURIComponent(order.id)}&provider=eq.mastercard_gateway&limit=1`, {
            headers: { apikey: requiredEnv("SUPABASE_SECRET_KEY"), Authorization: `Bearer ${requiredEnv("SUPABASE_SECRET_KEY")}` },
          });
          if (!paymentResponse.ok) throw new Error("Không thể đọc payment.");
          const payments = (await paymentResponse.json()) as Array<{ id: string; status: string; amount: number }>;
          const payment = payments[0];
          if (!payment || Number(payment.amount) !== Number(order.total)) throw new Error("Payment amount mismatch.");

          await verifyPayment(payment.id, successful.reference ?? successful.id, successful.id, {
            provider: "mastercard_gateway",
            gateway_order_id: gateway.id ?? orderCode,
            gateway_result: gateway.result ?? null,
            transaction_result: successful.result,
            gateway_code: successful.response?.gatewayCode ?? null,
            amount: Number(successful.amount),
            currency: successful.currency ?? "VND",
            verified_at: new Date().toISOString(),
          });

          return json({ success: true, status: "paid", orderCode, transactionId: successful.id });
        } catch (error) {
          console.error("Mastercard status error:", error);
          return json({ success: false, error: error instanceof Error ? error.message : "Không thể xác minh Mastercard." }, 500);
        }
      },
    },
  },
});
