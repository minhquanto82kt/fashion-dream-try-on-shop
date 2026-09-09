// Admin products route
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addProductImage,
  checkAdmin,
  createProduct,
  deleteProduct,
  getSession,
  getUser,
  listProducts,
  signIn,
  signOut,
  supabaseConfig,
  updateProduct,
  uploadProductImage,
  type Product,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products")({
  component: ProductAdminPage,
  head: () => ({
    meta: [{ title: "Products Admin — UpThink" }],
  }),
});

const categories = ["hoodies", "tees", "outerwear", "pants", "cap", "sunglass", "accessories"];

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  category: "tees",
  price: "0",
  short_description: "",
  long_description: "",
  image: "",
  status: "draft" as Product["status"],
  featured: false,
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ProductAdminPage() {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function boot() {
    setReady(false);
    setLoginError("");
    try {
      if (!supabaseConfig.url || !supabaseConfig.key || !getSession()) {
        setAuthorized(false);
        return;
      }
      const isAdmin = await checkAdmin();
      setAuthorized(Boolean(isAdmin));
      if (isAdmin) {
        setProducts(await listProducts());
      }
    } catch (error) {
      setAuthorized(false);
      setLoginError(error instanceof Error ? error.message : "Không thể xác thực admin.");
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    void boot();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.slug}`.toLowerCase();
      return (
        (!query || text.includes(query.toLowerCase())) &&
        (statusFilter === "all" || product.status === statusFilter) &&
        (categoryFilter === "all" || product.category === categoryFilter)
      );
    });
  }, [products, query, statusFilter, categoryFilter]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: String(product.price),
      short_description: product.short_description || "",
      long_description: product.long_description || product.description || "",
      image: product.image || "",
      status: product.status,
      featured: product.featured,
    });
    setMessage("");
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");
    try {
      await signIn(loginEmail, loginPassword);
      const isAdmin = await checkAdmin();
      if (!isAdmin) {
        signOut();
        throw new Error("Tài khoản này chưa được cấp quyền Admin.");
      }
      setAuthorized(true);
      setProducts(await listProducts());
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Đăng nhập thất bại.");
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setMessage("Vui lòng nhập tên sản phẩm.");
    if (!form.slug.trim()) return setMessage("Vui lòng nhập slug.");
    if (Number(form.price) < 0) return setMessage("Giá không hợp lệ.");

    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category,
        price: Number(form.price),
        short_description: form.short_description || null,
        long_description: form.long_description || null,
        description: form.long_description || form.short_description || null,
        image: form.image || null,
        status: form.status,
        active: form.status === "published",
        featured: form.featured,
      };

      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        const id = slugify(form.name) || `product-${Date.now()}`;
        const product = await createProduct({ id, ...payload });
        setEditing(product);
      }

      setProducts(await listProducts());
      setMessage("Đã lưu sản phẩm.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Xóa "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts(await listProducts());
      if (editing?.id === product.id) openNew();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xóa.");
    }
  }

  async function handleImageUpload(file?: File) {
    if (!file) return;
    if (!editing?.id) {
      setMessage("Hãy lưu sản phẩm trước, sau đó mới tải ảnh lên.");
      return;
    }
    setSaving(true);
    try {
      const url = await uploadProductImage(editing.id, file);
      await addProductImage(editing.id, url, true);
      await updateProduct(editing.id, { image: url });
      setForm((current) => ({ ...current, image: url }));
      setProducts(await listProducts());
      setMessage("Đã tải ảnh lên.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload ảnh thất bại.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return <AdminShell><div className="up-admin-loading">Loading admin…</div></AdminShell>;

  if (!authorized) {
    return (
      <AdminShell>
        <div className="up-admin-login">
          <div className="up-admin-login-card">
            <div className="up-admin-brand">UPTHINK<span>COMMERCE ADMIN</span></div>
            <h1>Đăng nhập quản trị</h1>
            <p>Chỉ tài khoản đã được cấp quyền trong <code>admin_users</code> mới có thể truy cập.</p>
            <form onSubmit={handleLogin}>
              <label>Email<input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /></label>
              <label>Mật khẩu<input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required /></label>
              {loginError && <div className="up-admin-error">{loginError}</div>}
              <button className="up-admin-primary" type="submit">ĐĂNG NHẬP →</button>
            </form>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="up-admin-app">
        <aside className="up-admin-sidebar">
          <div className="up-admin-logo">UPTHINK<span>COMMERCE ADMIN</span></div>
          <nav>
            <div className="up-admin-nav-section">MANAGE</div>
            <a className="active">Products</a>
            <a>Orders</a>
            <a>Customers</a>
            <a>Inventory</a>
            <div className="up-admin-nav-section">SYSTEM</div>
            <a>AI Studio</a>
            <a>Settings</a>
          </nav>
          <button className="up-admin-logout" onClick={() => { signOut(); setAuthorized(false); }}>↪ Đăng xuất</button>
        </aside>

        <main className="up-admin-main">
          <header className="up-admin-topbar">
            <div>
              <div className="up-admin-kicker">CATALOG / CMS</div>
              <h1>Products</h1>
              <p>Quản lý sản phẩm của cửa hàng</p>
            </div>
            <button className="up-admin-primary" onClick={openNew}>＋ THÊM SẢN PHẨM</button>
          </header>

          <section className="up-admin-toolbar">
            <input placeholder="⌕  Tìm kiếm sản phẩm…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đang hoạt động</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Đã ẩn</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </section>

          <section className="up-admin-stats">
            <div><span>TỔNG SẢN PHẨM</span><strong>{products.length}</strong></div>
            <div><span>ĐANG BÁN</span><strong>{products.filter((p) => p.status === "published").length}</strong></div>
            <div><span>BẢN NHÁP</span><strong>{products.filter((p) => p.status === "draft").length}</strong></div>
            <div><span>NỔI BẬT</span><strong>{products.filter((p) => p.featured).length}</strong></div>
          </section>

          <section className="up-admin-table-wrap">
            <table className="up-admin-table">
              <thead><tr><th>SẢN PHẨM</th><th>DANH MỤC</th><th>GIÁ</th><th>TRẠNG THÁI</th><th>NỔI BẬT</th><th></th></tr></thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="up-product-cell">
                        {product.image ? <img src={product.image} alt="" /> : <div className="up-product-placeholder">U</div>}
                        <div><strong>{product.name}</strong><small>/{product.slug}</small></div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td><strong>{money(product.price)}</strong></td>
                    <td><span className={`up-status ${product.status}`}>{product.status === "published" ? "Đang hoạt động" : product.status === "draft" ? "Bản nháp" : "Đã ẩn"}</span></td>
                    <td>{product.featured ? "●" : "—"}</td>
                    <td><button className="up-row-action" onClick={() => openEdit(product)}>SỬA</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <div className="up-admin-empty">Không có sản phẩm phù hợp.</div>}
          </section>

          {message && <div className="up-admin-toast">{message}</div>}

          {(editing || form.name !== "") && (
            <section className="up-admin-editor">
              <div className="up-editor-head">
                <div><div className="up-admin-kicker">{editing ? "EDIT PRODUCT" : "NEW PRODUCT"}</div><h2>{editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h2></div>
                <button className="up-icon-btn" onClick={openNew}>×</button>
              </div>
              <form onSubmit={handleSave} className="up-editor-grid">
                <div className="up-editor-left">
                  <label>Tên sản phẩm<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => !form.slug && setForm((f) => ({ ...f, slug: slugify(f.name) }))} /></label>
                  <label>Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
                  <div className="up-two-col">
                    <label>Danh mục<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
                    <label>Giá (VND)<input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
                  </div>
                  <label>Mô tả ngắn<textarea rows={3} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></label>
                  <label>Mô tả chi tiết<textarea rows={7} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} /></label>
                </div>
                <div className="up-editor-right">
                  <div className="up-upload-card" onClick={() => fileRef.current?.click()}>
                    {form.image ? <img src={form.image} alt="Product preview" /> : <div><b>＋</b><span>TẢI ẢNH SẢN PHẨM</span><small>PNG, JPG, WEBP</small></div>}
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void handleImageUpload(e.target.files?.[0])} />
                  </div>
                  <label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}><option value="draft">Bản nháp</option><option value="published">Đang hoạt động</option><option value="archived">Đã ẩn</option></select></label>
                  <label className="up-check"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Sản phẩm nổi bật</label>
                  <div className="up-editor-actions">
                    {editing && <button type="button" className="up-danger" onClick={() => void handleDelete(editing)}>XÓA</button>}
                    <button type="button" className="up-secondary" onClick={openNew}>HỦY</button>
                    <button type="submit" className="up-admin-primary" disabled={saving}>{saving ? "ĐANG LƯU…" : "LƯU SẢN PHẨM"}</button>
                  </div>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
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
        @media(max-width:900px){.up-admin-sidebar{width:190px}.up-admin-main{margin-left:190px;width:calc(100% - 190px);padding:30px 20px}.up-admin-stats{grid-template-columns:1fr 1fr}.up-editor-grid{grid-template-columns:1fr}.up-admin-topbar{align-items:flex-start;gap:15px;flex-direction:column}}
        @media(max-width:640px){.up-admin-sidebar{display:none}.up-admin-main{margin:0;width:100%}.up-admin-toolbar{flex-direction:column}.up-admin-table{min-width:720px}.up-admin-table-wrap{overflow:auto}}
      `}</style>
      {children}
    </div>
  );
}
