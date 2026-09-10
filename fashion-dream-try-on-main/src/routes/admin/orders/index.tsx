import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseConfig } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/orders/")({
  component: OrdersAdminPage,
  head: () => ({
    meta: [{ title: "Orders Admin — UpThink" }],
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
      return "Thất bại";
    case "refunded":
      return "Đã hoàn tiền";
    case "cancelled":
      return "Đã hủy";
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

function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = useCallback(async () => {
    if (!supabaseConfig.url || !supabaseConfig.key) {
      setMessage("Supabase chưa được cấu hình.");
      setLoading(false);
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `${supabaseConfig.url}/rest/v1/orders?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: supabaseConfig.key,
            Authorization: `Bearer ${supabaseConfig.key}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách đơn hàng.");
      }

      const data = (await response.json()) as Order[];
      setOrders(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách đơn hàng.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  function handleRefresh() {
    setRefreshing(true);
    void loadOrders();
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        order.order_code.toLowerCase().includes(normalizedQuery) ||
        order.customer_name.toLowerCase().includes(normalizedQuery) ||
        order.phone.toLowerCase().includes(normalizedQuery);

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status === paymentFilter;

      const matchesStatus =
        statusFilter === "all" ||
        order.order_status === statusFilter;

      return matchesQuery && matchesPayment && matchesStatus;
    });
  }, [orders, query, paymentFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pendingPayment: orders.filter(
        (order) => order.payment_status === "pending",
      ).length,
      confirmed: orders.filter(
        (order) => order.order_status === "confirmed",
      ).length,
      revenue: orders
        .filter((order) => order.payment_status === "paid")
        .reduce((sum, order) => sum + order.total, 0),
    }),
    [orders],
  );

  return (
    <div>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">COMMERCE / ORDERS</div>
          <h1>Orders</h1>
          <p>Quản lý đơn hàng và trạng thái thanh toán của khách hàng.</p>
        </div>

        <button
          className="up-admin-primary"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "ĐANG TẢI…" : "↻ LÀM MỚI"}
        </button>
      </header>

      <section className="up-admin-stats">
        <div>
          <span>TỔNG ĐƠN</span>
          <strong>{stats.total}</strong>
        </div>

        <div>
          <span>CHỜ THANH TOÁN</span>
          <strong>{stats.pendingPayment}</strong>
        </div>

        <div>
          <span>ĐÃ XÁC NHẬN</span>
          <strong>{stats.confirmed}</strong>
        </div>

        <div>
          <span>DOANH THU ĐÃ THANH TOÁN</span>
          <strong>{money(stats.revenue)}</strong>
        </div>
      </section>

      <section className="up-admin-toolbar">
        <input
          placeholder="⌕  Tìm mã đơn, khách hàng, số điện thoại…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
        >
          <option value="all">Tất cả thanh toán</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn tiền</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">Tất cả đơn hàng</option>
          <option value="new">Mới</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </section>

      <section className="up-admin-table-wrap">
        <table className="up-admin-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>KHÁCH HÀNG</th>
              <th>TỔNG TIỀN</th>
              <th>THANH TOÁN</th>
              <th>ĐƠN HÀNG</th>
              <th>NGÀY TẠO</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="up-admin-empty">
                  Đang tải đơn hàng…
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_code}</strong>
                    <small>
                      {paymentMethodLabel(order.payment_method)}
                    </small>
                  </td>

                  <td>
                    <div>
                      <strong>{order.customer_name}</strong>
                      <small>{order.phone}</small>
                    </div>
                  </td>

                  <td>
                    <strong>{money(order.total)}</strong>
                  </td>

                  <td>
                    <span
                      className={`up-status ${order.payment_status}`}
                    >
                      {paymentLabel(order.payment_status)}
                    </span>
                  </td>

                  <td>
                    <span className={`up-status ${order.order_status}`}>
                      {orderStatusLabel(order.order_status)}
                    </span>
                  </td>

                  <td>{formatDate(order.created_at)}</td>

                  <td>
                    <Link
                      to="/admin/orders/$id"
                      params={{ id: order.id }}
                      className="up-admin-primary"
                    >
                      XEM CHI TIẾT
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="up-admin-empty">
                  Không có đơn hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {message && <div className="up-admin-toast">{message}</div>}
    </div>
  );
}
