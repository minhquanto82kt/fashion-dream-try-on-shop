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
  paymentMethod: "cod" | "vietqr";
  items: OrderItemInput[];
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

type VariantRow = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
};

function createOrderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FD-${date}-${random}`;
}

export const createOrder = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: CreateOrderInput }) => {
    if (!data.items?.length) {
      throw new Error("Giỏ hàng đang trống.");
    }

    if (!data.customerName || !data.phone || !data.address) {
      throw new Error("Vui lòng nhập đầy đủ thông tin giao hàng.");
    }

    const productIds = [...new Set(data.items.map((item) => item.productId))];
    const productFilter = productIds.join(",");

    const products = await supabaseRequest<ProductRow[]>(
      `products?id=in.(${productFilter})&active=eq.true`,
    );

    const productMap = new Map(products.map((product) => [product.id, product]));
    let subtotal = 0;

    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error("Số lượng sản phẩm không hợp lệ.");
      }

      subtotal += product.price * item.quantity;

      return {
        product_id: product.id,
        product_name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: product.price,
      };
    });

    const shippingFee = subtotal >= 1000000 ? 0 : 30000;
    const orderCode = createOrderCode();

    const orders = await supabaseRequest<{ id: string; order_code: string }[]>(
      "orders",
      {
        method: "POST",
        body: JSON.stringify({
          order_code: orderCode,
          customer_name: data.customerName,
          phone: data.phone,
          email: data.email || null,
          address: data.address,
          city: data.city,
          district: data.district,
          payment_method: data.paymentMethod,
          payment_status: "pending",
          order_status: "new",
          subtotal,
          shipping_fee: shippingFee,
          total: subtotal + shippingFee,
        }),
      },
    );

    const order = orders[0];

    if (!order) {
      throw new Error("Không thể tạo đơn hàng.");
    }

    await supabaseRequest("order_items", {
      method: "POST",
      body: JSON.stringify(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        })),
      ),
    });

    return {
      orderCode: order.order_code,
      total: subtotal + shippingFee,
    };
  },
);
