import { createServerFn } from "@tanstack/react-start";
import { supabaseRequest } from "./supabase.server";

type OrderItemInput = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type CreateOrderInput = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  paymentMethod: "cod" | "vietqr" | "momo";
  items: OrderItemInput[];
};

function createOrderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `FD-${date}-${random}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: CreateOrderInput) => data)
  .handler(
  async ({ data }: { data: CreateOrderInput }) => {
    if (!data.items?.length) {
      throw new Error("Giỏ hàng đang trống.");
    }

    if (!data.customerName || !data.phone || !data.address) {
      throw new Error("Vui lòng nhập đầy đủ thông tin giao hàng.");
    }

    if (!["cod", "vietqr", "momo"].includes(data.paymentMethod)) {
      throw new Error("Phương thức thanh toán không hợp lệ.");
    }

    for (const item of data.items) {
      if (!item.productId || !item.size || !item.color) {
        throw new Error("Thông tin sản phẩm trong giỏ hàng không hợp lệ.");
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error("Số lượng sản phẩm không hợp lệ.");
      }
    }

    const orderCode = createOrderCode();

    const rpcItems = data.items.map((item) => ({
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

    const result = await supabaseRequest<
      {
        order_id: string;
        order_code: string;
        total: number;
      }[]
    >("rpc/create_order_atomic", {
      method: "POST",
      body: JSON.stringify({
        p_order_code: orderCode,
        p_customer_name: data.customerName.trim(),
        p_phone: data.phone.trim(),
        p_email: data.email?.trim() || null,
        p_address: data.address.trim(),
        p_city: data.city.trim(),
        p_district: data.district.trim(),
        p_payment_method: data.paymentMethod,
        p_items: rpcItems,
        p_note: null,
      }),
    });

    const order = result[0];

    if (!order) {
      throw new Error("Không thể tạo đơn hàng.");
    }

    return {
      orderId: order.order_id,
      orderCode: order.order_code,
      total: order.total,
    };
  },
);
