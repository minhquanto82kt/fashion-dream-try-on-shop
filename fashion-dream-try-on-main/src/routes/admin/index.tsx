import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { enterMockUserMode } from "@/lib/mock-user";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — WEARO" }] }),
});

const cards = [
  ["Products", "Manage catalog, pricing and publishing", "/admin/products"],
  ["Tags", "Manage catalog labels and product relationships", "/admin/tags"],
  ["Orders", "Review and manage customer orders", "/admin/orders"],
  ["Customers", "View customer accounts and activity", "#"],
  ["Inventory", "Track stock and availability", "/admin/inventory"],
  ["Appearance", "Control global color theme and visual system", "/admin/appearance"],
] as const;

function AdminDashboardPage() {
  const navigate = useNavigate();

  const startMockUser = () => {
    enterMockUserMode();
    void navigate({ to: "/account", search: { preview: "1" } });
  };

  return (
    <>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">WEARO / COMMERCE ADMIN</div>
          <h1>Dashboard</h1>
          <p>Quản lý catalog, đơn hàng, giao diện và các dịch vụ vận hành của cửa hàng.</p>
        </div>
      </header>

      <section className="up-admin-dashboard-stats">
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">Products</div><div className="up-admin-dashboard-value">CATALOG</div><div className="up-admin-dashboard-muted">Sản phẩm & variants</div></div>
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">Tags</div><div className="up-admin-dashboard-value">CRUDL</div><div className="up-admin-dashboard-muted">Python Admin API</div></div>
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">Orders</div><div className="up-admin-dashboard-value">ORDERS</div><div className="up-admin-dashboard-muted">Order lifecycle</div></div>
        <div className="up-admin-dashboard-card"><div className="up-admin-dashboard-label">AI</div><div className="up-admin-dashboard-value">STUDIO</div><div className="up-admin-dashboard-muted">Try-On controls</div></div>
      </section>

      <section className="up-admin-dashboard-section">
        <h2>Quick Actions</h2>
        <p>Truy cập nhanh các khu vực quản trị đang hoạt động.</p>
        <div className="up-admin-dashboard-actions">
          <button type="button" className="up-admin-dashboard-action" onClick={startMockUser} style={{ textAlign: "left", cursor: "pointer", width: "100%" }}>
            <div className="up-admin-dashboard-action-title">🧪 Mock User</div>
            <div className="up-admin-dashboard-action-desc">Xem trước WEARO như một khách hàng mà không cần đăng xuất Admin.</div>
            <span>Start preview →</span>
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