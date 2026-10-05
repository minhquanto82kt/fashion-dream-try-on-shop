import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { enterMockUserMode } from "@/lib/mock-user";
import { getSession } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — UpThink" }] }),
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [mockStarting, setMockStarting] = useState(false);
  const startMockUser = () => {
    setMockStarting(true);
    enterMockUserMode();
    void navigate({ to: "/account", search: { preview: "1" } as never }).finally(() => setMockStarting(false));
  };

  return (
    <>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">UPTHINK / WEARO CONTROL ROOM</div>
          <h1>Dashboard</h1>
          <p>UpThink là khu vực quản trị và vận hành hệ thống WEARO: catalog, đơn hàng, giao diện và các dịch vụ nền.</p>
        </div>
      </header>

      <section className="up-admin-dashboard-stats">
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">Products</div><div className="up-admin-dashboard-value">CATALOG</div><div className="up-admin-dashboard-muted">Sản phẩm & variants</div></div>
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">Tags</div><div className="up-admin-dashboard-value">CRUDL</div><div className="up-admin-dashboard-muted">Python Admin API</div></div>
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">Orders</div><div className="up-admin-dashboard-value">ORDERS</div><div className="up-admin-dashboard-muted">Order lifecycle</div></div>
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">AI</div><div className="up-admin-dashboard-value">STUDIO</div><div className="up-admin-dashboard-muted">Try-On controls</div></div>
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">Journal</div><div className="up-admin-dashboard-value">CMS</div><div className="up-admin-dashboard-muted">SEO & publishing workflow</div></div>
      </section>

      <section className="up-admin-dashboard-section">
        <h2>Quick Actions</h2>
        <p>Truy cập nhanh các khu vực quản trị đang hoạt động.</p>
        <div className="up-admin-dashboard-actions">
          <button type="button" className="up-admin-dashboard-action" onClick={startMockUser}>
            <div className="up-admin-dashboard-action-title">🧪 Mock User</div>
            <div className="up-admin-dashboard-action-desc">Xem trước website như một khách hàng mà không cần đăng nhập tài khoản khác.</div>
            <span>{mockStarting ? "Starting sandbox…" : "Start preview →"}</span>
          </button>
          {cards.map(([title, description, href]) => href === "#" ? (
            <div key={title} className="up-admin-dashboard-action up-admin-dashboard-action--soon" aria-disabled="true">
              <div className="up-admin-dashboard-action-title">{title}</div>
              <div className="up-admin-dashboard-action-desc">{description}</div>
              <span>Coming soon</span>
            </div>
          ) : (
            <Link key={title} className="up-admin-dashboard-action" to={href}>
              <div className="up-admin-dashboard-action-title">{title}</div>
              <div className="up-admin-dashboard-action-desc">{description}</div>
              <span>Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
