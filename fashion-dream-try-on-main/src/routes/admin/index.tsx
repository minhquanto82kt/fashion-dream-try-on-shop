import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — UpThink" }] }),
});

const cards = [
  ["Products", "Manage catalog, pricing and publishing", "/admin/products"],
  ["Orders", "Review and manage customer orders", "/admin/orders"],
  ["Customers", "View customer accounts and activity", "#"],
  ["Inventory", "Track stock and availability", "#"],
] as const;

function AdminDashboardPage() {
  return (
    <>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">ADMIN / OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>Manage your UpThink commerce operation from one place.</p>
        </div>
        <Link
          to="/shop"
          className="up-admin-secondary"
          style={{ textDecoration: "none" }}
        >
          View store ↗
        </Link>
      </header>

      <section className="up-admin-dashboard-stats">
        {[
          ["Products", "Catalog", "10"],
          ["Orders", "Pending review", "0"],
          ["Customers", "Registered", "0"],
          ["Revenue", "Store total", "0 ₫"],
        ].map(([name, label, value]) => (
          <div key={name} className="up-admin-dashboard-card">
            <div className="up-admin-dashboard-label">{name}</div>
            <div className="up-admin-dashboard-value">{value}</div>
            <div className="up-admin-dashboard-muted">{label}</div>
          </div>
        ))}
      </section>

      <section className="up-admin-dashboard-section">
        <h2>Quick actions</h2>
        <p>Start with the area you want to manage.</p>
        <div className="up-admin-dashboard-actions">
          {cards.map(([label, desc, href]) =>
            href.startsWith("/admin/") ? (
              <Link key={label} to={href} className="up-admin-dashboard-action">
                <div className="up-admin-dashboard-action-title">{label}</div>
                <div className="up-admin-dashboard-action-desc">{desc}</div>
                <span>Open manager →</span>
              </Link>
            ) : (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="up-admin-dashboard-action"
              >
                <div className="up-admin-dashboard-action-title">{label}</div>
                <div className="up-admin-dashboard-action-desc">{desc}</div>
                <span>Coming soon</span>
              </a>
            ),
          )}
        </div>
      </section>
    </>
  );
}
