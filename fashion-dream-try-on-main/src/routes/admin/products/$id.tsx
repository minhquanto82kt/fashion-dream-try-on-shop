import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProduct, updateProduct, type Product } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/$id/")({ component: ProductEditorPage });

function ProductEditorPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const data = await getProduct(id);
      if (!data) throw new Error("Không tìm thấy sản phẩm.");
      setProduct(data); setDraft(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể tải sản phẩm."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [id]);

  async function save() {
    if (!draft.name?.trim() || !draft.slug?.trim() || !draft.category?.trim() || Number(draft.price) < 0) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const saved = await updateProduct(id, {
        name: draft.name.trim(), slug: draft.slug.trim(), category: draft.category,
        price: Number(draft.price), description: draft.description ?? null,
        short_description: draft.short_description ?? null, long_description: draft.long_description ?? null,
        active: draft.active ?? true, status: draft.status ?? "draft", featured: draft.featured ?? false,
      });
      if (!saved) throw new Error("Không cập nhật được sản phẩm.");
      setProduct(saved); setDraft(saved); setMessage("Đã lưu sản phẩm.");
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể cập nhật sản phẩm."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="up-admin-empty">Đang tải sản phẩm…</div>;
  if (!product) return <div className="up-admin-empty">{error || "Không tìm thấy sản phẩm."}</div>;

  return (
    <div className="up-products-admin">
      <header className="up-admin-topbar">
        <div><div className="up-admin-kicker">CATALOG / PRODUCT</div><h1 className="up-products-page-title">{product.name}</h1><p className="up-products-page-description">/{product.slug}</p></div>
        <div style={{ display: "flex", gap: 8 }}><Link className="up-admin-secondary" to="/admin/products">QUAY LẠI</Link><button className="up-admin-primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "ĐANG LƯU…" : "LƯU THAY ĐỔI"}</button></div>
      </header>
      {error && <div className="up-admin-toast">{error}</div>}
      {message && <div className="up-admin-toast">{message}</div>}
      <section className="up-admin-table-wrap" style={{ padding: 24 }}>
        <h2>Thông tin sản phẩm</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <label>Tên<input value={draft.name ?? ""} onChange={(e) => setDraft(v => ({ ...v, name: e.target.value }))} /></label>
          <label>Slug<input value={draft.slug ?? ""} onChange={(e) => setDraft(v => ({ ...v, slug: e.target.value }))} /></label>
          <label>Danh mục<input value={draft.category ?? ""} onChange={(e) => setDraft(v => ({ ...v, category: e.target.value }))} /></label>
          <label>Giá<input type="number" min="0" value={draft.price ?? 0} onChange={(e) => setDraft(v => ({ ...v, price: Number(e.target.value) }))} /></label>
          <label>Mô tả ngắn<textarea value={draft.short_description ?? ""} onChange={(e) => setDraft(v => ({ ...v, short_description: e.target.value }))} /></label>
          <label>Mô tả<textarea value={draft.description ?? ""} onChange={(e) => setDraft(v => ({ ...v, description: e.target.value }))} /></label>
          <label>Mô tả dài<textarea value={draft.long_description ?? ""} onChange={(e) => setDraft(v => ({ ...v, long_description: e.target.value }))} /></label>
          <div><label><input type="checkbox" checked={Boolean(draft.active)} onChange={(e) => setDraft(v => ({ ...v, active: e.target.checked }))} /> Active</label><label><input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => setDraft(v => ({ ...v, featured: e.target.checked }))} /> Featured</label><label>Trạng thái<select value={draft.status ?? "draft"} onChange={(e) => setDraft(v => ({ ...v, status: e.target.value as Product["status"] }))}><option value="draft">Bản nháp</option><option value="published">Đang hoạt động</option><option value="archived">Đã ẩn</option></select></label></div>
        </div>
      </section>
    </div>
  );
}
