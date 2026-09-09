import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — UpThink" }] }),
});

const cards = [
  ["Products", "Manage catalog, pricing and publishing", "/admin/products"],
  ["Orders", "Review and manage customer orders", "#"],
  ["Customers", "View customer accounts and activity", "#"],
  ["Inventory", "Track stock and availability", "#"],
];

function AdminDashboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f3", color: "#111" }}>
      <aside style={{ position: "fixed", inset: "0 auto 0 0", width: 250, background: "#111", color: "#fff", padding: 24, boxSizing: "border-box" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.04em", marginBottom: 8 }}>UPTHINK</div>
        <div style={{ fontSize: 11, opacity: .55, letterSpacing: ".16em", marginBottom: 38 }}>COMMERCE ADMIN</div>
        <div style={{ fontSize: 11, opacity: .45, letterSpacing: ".12em", marginBottom: 12 }}>OVERVIEW</div>
        <a href="/admin" style={{ display: "block", padding: "12px 14px", borderRadius: 10, background: "#fff", color: "#111", textDecoration: "none", fontWeight: 700 }}>Dashboard</a>
        <div style={{ fontSize: 11, opacity: .45, letterSpacing: ".12em", margin: "28px 0 12px" }}>MANAGE</div>
        {cards.map(([label,,href]) => <a key={label} href={href} style={{ display: "block", padding: "11px 14px", color: "#bbb", textDecoration: "none", borderRadius: 10 }}>{label}</a>)}
        <div style={{ fontSize: 11, opacity: .45, letterSpacing: ".12em", margin: "28px 0 12px" }}>SYSTEM</div>
        <a href="#" style={{ display: "block", padding: "11px 14px", color: "#bbb", textDecoration: "none" }}>AI Studio</a>
        <a href="#" style={{ display: "block", padding: "11px 14px", color: "#bbb", textDecoration: "none" }}>Settings</a>
      </aside>
      <main style={{ marginLeft: 250, padding: "38px 44px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 34 }}>
          <div><div style={{ fontSize: 12, color: "#777", marginBottom: 8 }}>ADMIN / OVERVIEW</div><h1 style={{ margin: 0, fontSize: 38, letterSpacing: "-.04em" }}>Dashboard</h1><p style={{ color: "#777", marginTop: 8 }}>Manage your UpThink commerce operation from one place.</p></div>
          <a href="/shop" style={{ border: "1px solid #ddd", background: "#fff", padding: "11px 16px", borderRadius: 10, color: "#111", textDecoration: "none" }}>View store ↗</a>
        </div>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 16, marginBottom: 24 }}>
          {[['Products','Catalog'],['Orders','Pending review'],['Customers','Registered'],['Revenue','Store total']].map(([n,l]) => <div key={n} style={{ background: "#fff", border: "1px solid #e7e7e2", borderRadius: 16, padding: 22 }}><div style={{ color: "#777", fontSize: 13 }}>{n}</div><div style={{ fontSize: 28, fontWeight: 800, margin: "14px 0 4px" }}>—</div><div style={{ fontSize: 12, color: "#999" }}>{l}</div></div>)}
        </section>
        <section style={{ background: "#fff", border: "1px solid #e7e7e2", borderRadius: 18, padding: 26 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 22 }}>Quick actions</h2><p style={{ color: "#777", marginTop: 0 }}>Start with the area you want to manage.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14, marginTop: 22 }}>
            {cards.map(([label,desc,href]) => <a key={label} href={href} style={{ display: "block", border: "1px solid #e6e6e1", borderRadius: 14, padding: 20, color: "#111", textDecoration: "none" }}><div style={{ fontWeight: 800, fontSize: 17 }}>{label}</div><div style={{ color: "#777", fontSize: 13, margin: "7px 0 14px" }}>{desc}</div><span style={{ fontSize: 13, fontWeight: 700 }}>{label === 'Products' ? 'Open manager →' : 'Coming soon'}</span></a>)}
          </div>
        </section>
      </main>
    </div>
  );
}
