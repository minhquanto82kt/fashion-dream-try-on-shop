import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { signOut } from "@/lib/upthink-supabase";

export function AdminShell() {
  const location = useLocation();

  return (
    <div className="up-admin-root">
      <style>{`
        .up-admin-root{min-height:100vh;background:#f5f5f2;color:#171717;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
        .up-admin-root *{box-sizing:border-box}.up-admin-root button,.up-admin-root input,.up-admin-root select,.up-admin-root textarea{font:inherit}
        .up-admin-app{min-height:100vh;display:flex}.up-admin-sidebar{width:240px;background:#121313;color:#f3f1ea;padding:28px 18px;display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0}
        .up-admin-logo{font-weight:900;letter-spacing:.08em;font-size:18px}.up-admin-logo span,.up-admin-brand span{display:block;font-size:8px;letter-spacing:.18em;color:#f2a900;margin-top:4px}
        .up-admin-sidebar nav{margin-top:42px;display:grid;gap:5px}.up-admin-sidebar nav a{padding:11px 13px;color:#9b9c98;font-size:13px}.up-admin-sidebar nav a.active{background:#242727;color:#fff;border-left:2px solid #f2a900}.up-admin-nav-section{font-size:9px;letter-spacing:.18em;color:#626461;margin:17px 13px 5px}
        .up-admin-logout{margin-top:auto;background:none;border:0;color:#8d8e8b;text-align:left;padding:12px;cursor:pointer}
        .up-admin-main{margin-left:240px;width:calc(100% - 240px);padding:44px 52px 80px}.up-admin-topbar{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px}
        .up-admin-kicker{font-size:9px;letter-spacing:.2em;color:#8c8d89;font-weight:700}.up-admin-topbar h1,.up-admin-editor h2{margin:7px 0 5px;font-size:34px;letter-spacing:-.04em}.up-admin-topbar p{margin:0;color:#777;font-size:13px}
        .up-admin-primary{border:0;background:#f2a900;color:#111;padding:13px 19px;font-size:11px;font-weight:800;letter-spacing:.08em;cursor:pointer}.up-admin-primary:hover{filter:brightness(.96)}
        .up-admin-toolbar{display:flex;gap:10px;margin-bottom:18px}.up-admin-toolbar input{flex:1}.up-admin-toolbar input,.up-admin-toolbar select,.up-editor-left input,.up-editor-left select,.up-editor-left textarea,.up-editor-right select,.up-admin-login input{background:#fff;border:1px solid #dddcd5;padding:12px 13px;outline:none}.up-admin-toolbar input:focus,.up-admin-root input:focus,.up-admin-root textarea:focus,.up-admin-root select:focus{border-color:#b7b6ae}
        .up-admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.up-admin-stats div{background:#fff;border:1px solid #e3e2dc;padding:16px 18px}.up-admin-stats span{font-size:9px;color:#898a86;letter-spacing:.13em}.up-admin-stats strong{display:block;font-size:23px;margin-top:8px}
        .up-admin-table-wrap{background:#fff;border:1px solid #e3e2dc}.up-admin-table{width:100%;border-collapse:collapse}.up-admin-table th{text-align:left;background:#fafaf7;color:#8a8b86;font-size:9px;letter-spacing:.12em;padding:12px 15px;border-bottom:1px solid #e3e2dc}.up-admin-table td{padding:13px 15px;border-bottom:1px solid #eeeDE8;font-size:12px}.up-product-cell{display:flex;align-items:center;gap:12px}.up-product-cell img,.up-product-placeholder{width:48px;height:58px;object-fit:cover;background:#ecebe5}.up-product-placeholder{display:grid;place-items:center;font-weight:900;color:#f2a900}.up-product-cell strong{display:block}.up-product-cell small{display:block;color:#9a9b96;margin-top:4px}.up-status{display:inline-block;padding:5px 9px;font-size:9px;font-weight:700}.up-status.published{background:#def4e8;color:#167243}.up-status.draft{background:#fff1c9;color:#916b00}.up-status.archived{background:#e7e7e5;color:#6b6c68}.up-row-action,.up-icon-btn{border:1px solid #dddcd5;background:#fff;padding:7px 9px;font-size:9px;cursor:pointer}.up-admin-empty{padding:35px;text-align:center;color:#888}
        .up-admin-toast{position:fixed;right:25px;bottom:25px;background:#171717;color:#fff;padding:13px 17px;font-size:12px;z-index:20}.up-admin-editor{margin-top:24px;background:#fff;border:1px solid #dddcd5;padding:25px}.up-editor-head{display:flex;justify-content:space-between;margin-bottom:22px}.up-editor-head h2{font-size:25px}.up-editor-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:30px}.up-editor-left,.up-editor-right{display:grid;gap:15px}.up-editor-left label,.up-editor-right label,.up-admin-login label{display:grid;gap:7px;font-size:10px;font-weight:800;letter-spacing:.04em}.up-two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.up-editor-left textarea{resize:vertical}.up-upload-card{height:290px;border:1px dashed #c9c8c1;background:#fafaf7;display:grid;place-items:center;cursor:pointer;overflow:hidden}.up-upload-card div{text-align:center;color:#777}.up-upload-card b{display:block;font-size:28px;color:#f2a900}.up-upload-card span,.up-upload-card small{display:block;font-size:10px;letter-spacing:.12em}.up-upload-card small{margin-top:7px;color:#aaa}.up-upload-card img{width:100%;height:100%;object-fit:contain;background:#f0efe9}.up-check{display:flex!important;grid-template-columns:auto 1fr!important;align-items:center}.up-check input{accent-color:#f2a900}.up-editor-actions{display:flex;justify-content:flex-end;gap:9px;align-items:center;margin-top:auto}.up-secondary,.up-danger{background:#fff;border:1px solid #dddcd5;padding:13px 17px;font-size:10px;font-weight:800;cursor:pointer}.up-danger{color:#c52d2d}.up-admin-loading{display:grid;place-items:center;min-height:100vh;color:#777}.up-admin-login{min-height:100vh;display:grid;place-items:center;padding:20px}.up-admin-login-card{width:min(430px,100%);background:#fff;border:1px solid #dddcd5;padding:35px}.up-admin-brand{font-weight:900;letter-spacing:.1em}.up-admin-login-card h1{font-size:28px;margin:28px 0 8px}.up-admin-login-card p{font-size:12px;line-height:1.6;color:#777;margin-bottom:22px}.up-admin-login form{display:grid;gap:15px}.up-admin-login input{width:100%}.up-admin-error{background:#fff0ef;color:#a32727;border:1px solid #f0c4c0;padding:10px;font-size:11px}
        .up-admin-dashboard-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:24px}
        .up-admin-dashboard-card,.up-admin-dashboard-section{background:#fff;border:1px solid #e3e2dc;border-radius:16px}
        .up-admin-dashboard-card{padding:22px}.up-admin-dashboard-label{color:#777;font-size:13px}.up-admin-dashboard-value{font-size:28px;font-weight:800;margin:14px 0 4px}.up-admin-dashboard-muted{font-size:12px;color:#999}
        .up-admin-dashboard-section{padding:26px}.up-admin-dashboard-section h2{margin:0 0 6px;font-size:22px}.up-admin-dashboard-section>p{color:#777;margin:0}
        .up-admin-dashboard-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:22px}
        .up-admin-dashboard-action{display:block;border:1px solid #e6e6e1;border-radius:14px;padding:20px;color:#111;text-decoration:none}
        .up-admin-dashboard-action-title{font-weight:800;font-size:17px}.up-admin-dashboard-action-desc{color:#777;font-size:13px;margin:7px 0 14px}.up-admin-dashboard-action span{font-size:13px;font-weight:700}
        @media(max-width:900px){.up-admin-sidebar{width:190px}.up-admin-main{margin-left:190px;width:calc(100% - 190px);padding:30px 20px}.up-admin-stats{grid-template-columns:1fr 1fr}.up-admin-dashboard-stats{grid-template-columns:1fr 1fr}.up-editor-grid{grid-template-columns:1fr}.up-admin-dashboard-actions{grid-template-columns:1fr}.up-admin-topbar{align-items:flex-start;gap:15px;flex-direction:column}}
        @media(max-width:640px){.up-admin-sidebar{display:none}.up-admin-main{margin:0;width:100%}.up-admin-toolbar{flex-direction:column}.up-admin-table{min-width:720px}.up-admin-table-wrap{overflow:auto}}
      `}</style>
      <div className="up-admin-app">
        <aside className="up-admin-sidebar">
          <div className="up-admin-logo">UPTHINK<span>COMMERCE ADMIN</span></div>
          <nav>
            <div className="up-admin-nav-section">OVERVIEW</div>
            <Link
              to="/admin"
              className={location.pathname === "/admin" ? "active" : ""}
            >
              Dashboard
            </Link>

            <div className="up-admin-nav-section">MANAGE</div>
            <Link
              to="/admin/products"
              className={location.pathname.startsWith("/admin/products") ? "active" : ""}
            >
              Products
            </Link>
            <a href="#" onClick={(e) => e.preventDefault()}>Orders</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Customers</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Inventory</a>

            <div className="up-admin-nav-section">SYSTEM</div>
            <a href="#" onClick={(e) => e.preventDefault()}>AI Studio</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Settings</a>
          </nav>

          <button
            className="up-admin-logout"
            onClick={() => {
              signOut();
              window.location.href = "/admin";
            }}
          >
            ↪ Đăng xuất
          </button>
        </aside>

        <main className="up-admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
