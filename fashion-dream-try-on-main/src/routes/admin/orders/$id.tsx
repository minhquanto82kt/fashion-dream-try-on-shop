import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabaseConfig } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetailAdminPage,
  head: () => ({
    meta: [{ title: "Order Detail — UpThink" }],
  }),
});

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  district: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  note: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  variant_id: string | null;
  created_at: string;
};

type Payment = {
  id: string;
  order_id: string;
  method: string;
  status: string;
  amount: number;
  transaction_ref: string | null;
  provider: string | null;
  provider_transaction_id: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

const ORDER_STATUSES = [
  { value: "new", label: "Mới" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function paymentLabel(status: string) {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "failed":
      return "Thanh toán thất bại";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return "Chờ thanh toán";
  }
}

function orderStatusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";
    case "shipping":
      return "Đang giao";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Mới";
  }
}

function paymentMethodLabel(method: string) {
  switch (method) {
    case "vietqr":
      return "VietQR";
    case "cod":
      return "COD";
    default:
      return method;
  }
}

function OrderDetailAdminPage() {
  const { id } = Route.useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!supabaseConfig.url || !supabaseConfig.key) {
      setMessage("Supabase chưa được cấu hình.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const headers = {
        apikey: supabaseConfig.key,
        Authorization: `Bearer ${supabaseConfig.key}`,
      };

      const [orderResponse, itemsResponse, paymentResponse] =
        await Promise.all([
          fetch(
            `${supabaseConfig.url}/rest/v1/orders?id=eq.${encodeURIComponent(
              id,
            )}&select=*`,
            { headers },
          ),

          fetch(
            `${supabaseConfig.url}/rest/v1/order_items?order_id=eq.${encodeURIComponent(
              id,
            )}&select=*&order=created_at.asc`,
            { headers },
          ),

          fetch(
            `${supabaseConfig.url}/rest/v1/payments?order_id=eq.${encodeURIComponent(
              id,
            )}&select=*`,
            { headers },
          ),
        ]);

      if (!orderResponse.ok) {
        throw new Error("Không thể tải thông tin đơn hàng.");
      }

      if (!itemsResponse.ok) {
        throw new Error("Không thể tải sản phẩm trong đơn hàng.");
      }

      if (!paymentResponse.ok) {
        throw new Error("Không thể tải thông tin thanh toán.");
      }

      const orderData = (await orderResponse.json()) as Order[];
      const itemsData = (await itemsResponse.json()) as OrderItem[];
      const paymentData = (await paymentResponse.json()) as Payment[];

      if (!orderData.length) {
        setOrder(null);
        setItems([]);
        setPayment(null);
        setMessage("Không tìm thấy đơn hàng.");
        return;
      }

      setOrder(orderData[0]);
      setItems(itemsData);
      setPayment(paymentData[0] ?? null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin đơn hàng.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateOrderStatus = useCallback(
    async (nextStatus: string) => {
      if (!supabaseConfig.url || !supabaseConfig.key) {
        setMessage("Supabase chưa được cấu hình.");
        return;
      }

      if (!order) {
        return;
      }

      if (nextStatus === order.order_status) {
        return;
      }

      const isValidStatus = ORDER_STATUSES.some(
        (status) => status.value === nextStatus,
      );

      if (!isValidStatus) {
        setMessage("Trạng thái đơn hàng không hợp lệ.");
        return;
      }

      try {
        setUpdatingStatus(true);
        setMessage("");

        const headers = {
          apikey: supabaseConfig.key,
          Authorization: `Bearer ${supabaseConfig.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        };

        const response = await fetch(
          `${supabaseConfig.url}/rest/v1/orders?id=eq.${encodeURIComponent(
            order.id,
          )}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              order_status: nextStatus,
            }),
          },
        );

        if (!response.ok) {
          const errorBody = await response.text();

          throw new Error(
            errorBody || "Không thể cập nhật trạng thái đơn hàng.",
          );
        }

        const updatedOrders = (await response.json()) as Order[];

        if (!updatedOrders.length) {
          throw new Error(
            "Không cập nhật được đơn hàng. Có thể quyền RLS chưa cho phép UPDATE.",
          );
        }

        await loadOrder();

        setMessage(
          `Đã cập nhật trạng thái: ${orderStatusLabel(nextStatus)}.`,
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Không thể cập nhật trạng thái đơn hàng.",
        );
      } finally {
        setUpdatingStatus(false);
      }
    },
    [loadOrder, order],
  );

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <div className="up-admin-empty">
        Đang tải thông tin đơn hàng…
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <header className="up-admin-topbar">
          <div>
            <div className="up-admin-kicker">COMMERCE / ORDERS</div>
            <h1>Không tìm thấy đơn hàng</h1>
          </div>

          <Link to="/admin/orders" className="up-admin-primary">
            ← QUAY LẠI
          </Link>
        </header>

        {message && <div className="up-admin-toast">{message}</div>}
      </div>
    );
  }

  return (
    <div>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">COMMERCE / ORDERS / DETAIL</div>

          <h1>{order.order_code}</h1>

          <p>Tạo ngày {formatDate(order.created_at)}</p>
        </div>

        <Link to="/admin/orders" className="up-admin-primary">
          ← DANH SÁCH ĐƠN
        </Link>
      </header>

      <section className="up-admin-stats">
        <div>
          <span>TRẠNG THÁI ĐƠN</span>
          <strong>{orderStatusLabel(order.order_status)}</strong>
        </div>

        <div>
          <span>THANH TOÁN</span>
          <strong>{paymentLabel(order.payment_status)}</strong>
        </div>

        <div>
          <span>PHƯƠNG THỨC</span>
          <strong>
            {paymentMethodLabel(order.payment_method)}
          </strong>
        </div>

        <div>
          <span>TỔNG ĐƠN</span>
          <strong>{money(order.total)}</strong>
        </div>
      </section>

      <section
        className="up-admin-table-wrap"
        style={{ marginTop: 24 }}
      >
        <div
          style={{
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ marginBottom: 8 }}>
              Cập nhật trạng thái đơn hàng
            </h2>

            <p style={{ margin: 0 }}>
              Trạng thái hiện tại:{" "}
              <strong>
                {orderStatusLabel(order.order_status)}
              </strong>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <select
              value={order.order_status}
              disabled={updatingStatus}
              onChange={(event) => {
                void updateOrderStatus(event.target.value);
              }}
              style={{
                minWidth: 190,
                padding: "10px 12px",
                border: "1px solid #d8d8d4",
                background: "#fff",
                fontSize: 13,
                cursor: updatingStatus ? "wait" : "pointer",
              }}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {updatingStatus && (
              <span style={{ fontSize: 12 }}>
                Đang cập nhật…
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="up-admin-table-wrap">
        <div style={{ padding: "24px" }}>
          <h2>Thông tin khách hàng</h2>

          <p>
            <strong>Họ tên:</strong> {order.customer_name}
          </p>

          <p>
            <strong>Số điện thoại:</strong> {order.phone}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {order.email || "Không cung cấp"}
          </p>

          <p>
            <strong>Địa chỉ:</strong>{" "}
            {order.address}, {order.district}, {order.city}
          </p>

          {order.note && (
            <p>
              <strong>Ghi chú:</strong> {order.note}
            </p>
          )}
        </div>
      </section>

      <section
        className="up-admin-table-wrap"
        style={{ marginTop: 24 }}
      >
        <div style={{ padding: "24px" }}>
          <h2>Sản phẩm trong đơn</h2>

          {items.length === 0 ? (
            <p className="up-admin-empty">
              Đơn hàng chưa có sản phẩm.
            </p>
          ) : (
            <table className="up-admin-table">
              <thead>
                <tr>
                  <th>SẢN PHẨM</th>
                  <th>SIZE</th>
                  <th>MÀU</th>
                  <th>SỐ LƯỢNG</th>
                  <th>ĐƠN GIÁ</th>
                  <th>THÀNH TIỀN</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.product_name}</strong>
                    </td>

                    <td>{item.size}</td>

                    <td>{item.color}</td>

                    <td>{item.quantity}</td>

                    <td>{money(item.unit_price)}</td>

                    <td>
                      <strong>
                        {money(item.unit_price * item.quantity)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section
        className="up-admin-table-wrap"
        style={{ marginTop: 24 }}
      >
        <div style={{ padding: "24px" }}>
          <h2>Tổng thanh toán</h2>

          <p>
            <strong>Tạm tính:</strong>{" "}
            {money(order.subtotal)}
          </p>

          <p>
            <strong>Phí vận chuyển:</strong>{" "}
            {money(order.shipping_fee)}
          </p>

          <p>
            <strong>Tổng cộng:</strong>{" "}
            {money(order.total)}
          </p>
        </div>
      </section>

      <section
        className="up-admin-table-wrap"
        style={{ marginTop: 24 }}
      >
        <div style={{ padding: "24px" }}>
          <h2>Thanh toán</h2>

          <p>
            <strong>Phương thức:</strong>{" "}
            {paymentMethodLabel(
              payment?.method ?? order.payment_method,
            )}
          </p>

          <p>
            <strong>Trạng thái:</strong>{" "}
            {paymentLabel(
              payment?.status ?? order.payment_status,
            )}
          </p>

          {payment?.transaction_ref && (
            <p>
              <strong>Mã giao dịch:</strong>{" "}
              {payment.transaction_ref}
            </p>
          )}

          {payment?.provider && (
            <p>
              <strong>Provider:</strong>{" "}
              {payment.provider}
            </p>
          )}

          {payment?.paid_at && (
            <p>
              <strong>Thanh toán lúc:</strong>{" "}
              {formatDate(payment.paid_at)}
            </p>
          )}

          {payment?.failure_reason && (
            <p>
              <strong>Lý do thất bại:</strong>{" "}
              {payment.failure_reason}
            </p>
          )}
        </div>
      </section>

      {message && <div className="up-admin-toast">{message}</div>}
    </div>
  );
}
