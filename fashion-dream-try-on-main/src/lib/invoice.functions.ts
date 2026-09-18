import { createServerFn } from "@tanstack/react-start";
import { supabaseRequest } from "./supabase.server";

export type InvoiceItem = {
  product_name: string;
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceData = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  district: string;
  payment_method: "cod" | "vietqr" | "momo" | string;
  payment_status: string;
  order_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  items: InvoiceItem[];
};

type InvoiceRequest = {
  orderCode: string;
  phone: string;
};

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export const getInvoiceData = createServerFn({ method: "POST" })
  .validator((data: InvoiceRequest) => data)
  .handler(async ({ data }: { data: InvoiceRequest }) => {
    const orderCode = data.orderCode.trim();
    const phone = normalizePhone(data.phone);

    if (!orderCode || !phone) {
      throw new Error("Thiếu mã đơn hàng hoặc số điện thoại.");
    }

    const orders = await supabaseRequest<InvoiceData[]>(
      `orders?order_code=eq.${encodeURIComponent(orderCode)}&select=id,order_code,customer_name,phone,email,address,city,district,payment_method,payment_status,order_status,subtotal,shipping_fee,total,created_at&limit=1`,
      { method: "GET" },
    );

    const order = orders[0];
    if (!order || normalizePhone(order.phone) !== phone) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    const isCod = order.payment_method === "cod";
    const isPaidOnline =
      (order.payment_method === "vietqr" || order.payment_method === "momo") &&
      order.payment_status === "paid";

    if (!isCod && !isPaidOnline) {
      throw new Error("INVOICE_NOT_READY");
    }

    const items = await supabaseRequest<InvoiceItem[]>(
      `order_items?order_id=eq.${encodeURIComponent(order.id)}&select=product_name,product_id,size,color,quantity,unit_price&order=created_at.asc`,
      { method: "GET" },
    );

    return { ...order, items };
  });

export const waitForInvoice = createServerFn({ method: "POST" })
  .validator((data: InvoiceRequest) => data)
  .handler(async ({ data }: { data: InvoiceRequest }) => {
    try {
      return await getInvoiceData({ data });
    } catch (error) {
      if (error instanceof Error && error.message === "INVOICE_NOT_READY") {
        return null;
      }
      throw error;
    }
  });
