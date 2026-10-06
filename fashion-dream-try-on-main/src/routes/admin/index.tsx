import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { enterMockUserMode } from "@/lib/mock-user";
import { getSession } from "@/lib/upthink-supabase";
import { getAdminDashboardStats, type AdminDashboardStats } from "@/lib/admin-dashboard.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — WEARO" }] }),
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [mockStarting, setMockStarting] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let mounted = true;
    const accessToken = getSession()?.access_token?.trim();

    if (!accessToken) {
      setStatsError("Phiên admin không hợp lệ. Vui lòng đăng nhập lại.");
      return () => {
        mounted = false;
      };
    }

    void getAdminDashboardStats({ data: { accessToken } })
      .then((data) => {
        if (!mounted) return;
        setStats(data);
        setStatsError("");
      })
      .catch((error) => {
        if (!mounted) return;
        setStatsError(error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const startMockUser = () => {
    setMockStarting(true);
    enterMockUserMode();
    void navigate({ to: "/account", search: { preview: "1" } as never }).finally(() => setMockStarting(false));
  };

  return (
    <>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">WEARO / CONTROL ROOM</div>
          <h1>Dashboard</h1>
          <p>Overview vận hành thực tế của catalog, đơn hàng, tồn kho và Journal.</p>
        </div>
      </header>

      {statsError ? (
        <div className="up-admin-error" role="alert">{statsError}</div>
      ) : null}

      <section className="up-admin-dashboard-kpis" aria-label="Operational KPIs">
        <div className="up-admin-dashboard-kpi">
          <div className="up-admin-dashboard-label">Doanh thu hôm nay</div>
          <div className="up-admin-dashboard-value">
            {stats ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(stats.revenueToday) : "—"}
          </div>
          <div className="up-admin-dashboard-muted">Đơn đã thanh toán</div>
        </div>
        <div className="up-admin-dashboard-kpi">
          <div className="up-admin-dashboard-label">Đơn cần xử lý</div>
          <div className="up-admin-dashboard-value">{stats?.ordersToProcess ?? "—"}</div>
          <div className="up-admin-dashboard-muted">New + confirmed</div>
        </div>
        <div className="up-admin-dashboard-kpi">
          <div className="up-admin-dashboard-label">Sản phẩm</div>
          <div className="up-admin-dashboard-value">{stats?.products ?? "—"}</div>
          <div className="up-admin-dashboard-muted">{stats ? `${stats.publishedProducts} đang published` : "Đang tải dữ liệu"}</div>
        </div>
        <div className="up-admin-dashboard-kpi">
          <div className="up-admin-dashboard-label">Hết hàng</div>
          <div className="up-admin-dashboard-value">{stats?.outOfStockProducts ?? "—"}</div>
          <div className="up-admin-dashboard-muted">Theo variants</div>
        </div>
        <div className="up-admin-dashboard-kpi">
          <div className="up-admin-dashboard-label">Journal</div>
          <div className="up-admin-dashboard-value">{stats ? stats.journalPublished + stats.journalDraft + stats.journalScheduled : "—"}</div>
          <div className="up-admin-dashboard-muted">
            {stats ? `${stats.journalPublished} published · ${stats.journalDraft} draft · ${stats.journalScheduled} scheduled` : "Đang tải dữ liệu"}
          </div>
        </div>
      </section>

      <section className="up-admin-dashboard-section">
        <h2>Quick Actions</h2>
        <p>Truy cập nhanh các khu vực quản trị đang hoạt động.</p>
        <div className="up-admin-dashboard-actions">
          <Link className="up-admin-dashboard-action" to="/admin/products">
            <div className="up-admin-dashboard-action-title">Sản phẩm</div>
            <div className="up-admin-dashboard-action-desc">Quản lý catalog, giá, trạng thái và variants.</div>
            <span>Open →</span>
          </Link>
          <Link className="up-admin-dashboard-action" to="/admin/orders">
            <div className="up-admin-dashboard-action-title">Đơn hàng</div>
            <div className="up-admin-dashboard-action-desc">Xử lý đơn mới và theo dõi vòng đời đơn hàng.</div>
            <span>Open →</span>
          </Link>
          <Link className="up-admin-dashboard-action" to="/admin/journal">
            <div className="up-admin-dashboard-action-title">Journal</div>
            <div className="up-admin-dashboard-action-desc">Tạo bài viết, SEO và workflow publishing.</div>
            <span>Open →</span>
          </Link>
          <Link className="up-admin-dashboard-action" to="/admin/inventory">
            <div className="up-admin-dashboard-action-title">Tồn kho</div>
            <div className="up-admin-dashboard-action-desc">Kiểm tra stock theo product variant.</div>
            <span>Open →</span>
          </Link>
          <button type="button" className="up-admin-dashboard-action up-admin-dashboard-action--preview" onClick={startMockUser}>
            <div className="up-admin-dashboard-action-title">Chế độ xem trước</div>
            <div className="up-admin-dashboard-action-desc">Xem website như khách hàng mà không cần đăng nhập tài khoản khác.</div>
            <span>{mockStarting ? "Starting preview…" : "Start preview →"}</span>
          </button>
        </div>
      </section>
    </>
  );
}
