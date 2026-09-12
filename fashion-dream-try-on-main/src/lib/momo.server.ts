import { createHmac, randomUUID } from "node:crypto";
import { supabaseRequest } from "./supabase.server";

type MomoConfig = {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  apiUrl: string;
  redirectUrl: string;
  ipnUrl: string;
  partnerName: string;
  storeId: string;
};

type MomoCreateResponse = {
  partnerCode?: string;
  requestId?: string;
  orderId?: string;
  amount?: number;
  responseTime?: number;
  message?: string;
  resultCode?: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
};

type OrderForMomo = {
  id: string;
  order_code: string;
  total: number;
  payment_method: string;
  payment_status: string;
};

function getConfig(): MomoConfig {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const apiUrl = process.env.MOMO_API_URL ?? "https://test-payment.momo.vn/v2/gateway/api/create";
  const redirectUrl = process.env.MOMO_REDIRECT_URL;
  const ipnUrl = process.env.MOMO_IPN_URL;
  const partnerName = process.env.MOMO_PARTNER_NAME ?? "Fashion Dream Try-On Shop";
  const storeId = process.env.MOMO_STORE_ID ?? "FashionDreamTryOn";

  if (!partnerCode || !accessKey || !secretKey || !redirectUrl || !ipnUrl) {
    throw new Error(
      "Thiếu cấu hình MoMo server: MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_REDIRECT_URL hoặc MOMO_IPN_URL.",
    );
  }

  return {
    partnerCode,
    accessKey,
    secretKey,
    apiUrl,
    redirectUrl,
    ipnUrl,
    partnerName,
    storeId,
  };
}

function signCreateRequest(
  config: MomoConfig,
  payload: {
    amount: number;
    extraData: string;
    ipnUrl: string;
    orderId: string;
    orderInfo: string;
    partnerCode: string;
    redirectUrl: string;
    requestId: string;
    requestType: string;
  },
): string {
  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData}`,
    `ipnUrl=${payload.ipnUrl}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `partnerCode=${payload.partnerCode}`,
    `redirectUrl=${payload.redirectUrl}`,
    `requestId=${payload.requestId}`,
    `requestType=${payload.requestType}`,
  ].join("&");

  return createHmac("sha256", config.secretKey)
    .update(rawSignature, "utf8")
    .digest("hex");
}

async function saveMomoRequestMetadata(
  orderId: string,
  metadata: Record<string, unknown>,
) {
  await supabaseRequest(
    `payments?order_id=eq.${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        metadata,
        updated_at: new Date().toISOString(),
      }),
    },
  );
}

export async function createMomoPayment(orderCode: string) {
  const config = getConfig();
  const normalizedOrderCode = orderCode.trim();

  if (!/^FD-\d{8}-[A-Z0-9]{5}$/.test(normalizedOrderCode)) {
    throw new Error("Mã đơn hàng không hợp lệ.");
  }

  const orders = await supabaseRequest<OrderForMomo[]>(
    `orders?select=id,order_code,total,payment_method,payment_status&order_code=eq.${encodeURIComponent(normalizedOrderCode)}&limit=1`,
  );
  const order = orders[0];

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng.");
  }

  if (order.payment_method !== "momo") {
    throw new Error("Đơn hàng không sử dụng MoMo.");
  }

  if (order.payment_status !== "pending") {
    throw new Error("Đơn hàng không còn ở trạng thái chờ thanh toán.");
  }

  if (!Number.isSafeInteger(order.total) || order.total < 1000) {
    throw new Error("Số tiền thanh toán MoMo không hợp lệ.");
  }

  const requestId = `FD-${order.order_code}-${randomUUID().replaceAll("-", "")}`;
  const requestType = "captureWallet";
  const extraData = Buffer.from(
    JSON.stringify({ orderCode: order.order_code }),
    "utf8",
  ).toString("base64");

  const requestPayload = {
    partnerCode: config.partnerCode,
    partnerName: config.partnerName,
    storeId: config.storeId,
    requestType,
    ipnUrl: config.ipnUrl,
    redirectUrl: config.redirectUrl,
    orderId: order.order_code,
    amount: order.total,
    lang: "vi",
    orderInfo: `Thanh toán đơn hàng ${order.order_code}`,
    requestId,
    extraData,
    autoCapture: true,
  };

  const signature = signCreateRequest(config, {
    amount: requestPayload.amount,
    extraData: requestPayload.extraData,
    ipnUrl: requestPayload.ipnUrl,
    orderId: requestPayload.orderId,
    orderInfo: requestPayload.orderInfo,
    partnerCode: requestPayload.partnerCode,
    redirectUrl: requestPayload.redirectUrl,
    requestId: requestPayload.requestId,
    requestType: requestPayload.requestType,
  });

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ ...requestPayload, signature }),
  });

  const result = (await response.json()) as MomoCreateResponse;

  if (!response.ok || result.resultCode !== 0 || !result.payUrl) {
    console.error("MoMo create payment failed:", {
      status: response.status,
      resultCode: result.resultCode,
      message: result.message,
      requestId,
      orderCode: order.order_code,
    });

    throw new Error(
      result.message || `MoMo API trả về lỗi HTTP ${response.status}.`,
    );
  }

  await saveMomoRequestMetadata(order.id, {
    provider: "momo",
    request_id: requestId,
    order_id: result.orderId ?? order.order_code,
    result_code: result.resultCode,
    pay_url: result.payUrl,
    created_at: new Date().toISOString(),
  });

  return {
    orderCode: order.order_code,
    requestId,
    payUrl: result.payUrl,
    deeplink: result.deeplink ?? null,
    qrCodeUrl: result.qrCodeUrl ?? null,
    resultCode: result.resultCode,
  };
}
