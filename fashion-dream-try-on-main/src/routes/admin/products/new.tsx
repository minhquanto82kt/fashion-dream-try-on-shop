import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { createProduct } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProductPage,
  head: () => ({ meta: [{ title: "New Product — UpThink" }] }),
});

function NewProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", slug: "", category: "tees", price: "", description: "", short_description: "", long_description: "", status: "draft" as "draft" | "published", active: true, featured: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const price = Number(form.price);
    if (!form.name.trim() || !form.slug.trim() || !Number.isFinite(price) || price < 0 || !form.category.trim()) {
      setError("Vui lòng nhập tên, slug, danh mục và giá hợp lệ.");
      return;
    }
    setSaving(true);
    try {
      const product = await createProduct({ ...form, name: form.name.trim(), slug: form.slug.trim(), category: form.category.trim(), price });
      if (!product) throw new Error("Không nhận được sản phẩm sau khi tạo.");
      await navigate({ to: "/admin/products/$id", params: { id: product.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo sản phẩm.");
    } finally { setSaving(false); }
  }

  return <div className="up-products-admin"><header className="up-admin-topbar"><div><div className="up-admin-kicker">CATALOG / CMS</div><h1 className="up-products-page-title">New Product</h1><p className="up-products-page-description">Tạo sản phẩm mới trong Supabase</p></div><Link className="up-row-action" to="/admin/products">← QUAY LẠI</Link></header><form className="up-admin-form" onSubmit={submit}><label>Tên sản phẩm<input value={form.name} onChange={(e) => update("name", e.target.value)} required /></label><label>Slug<input value={form.slug} onChange={(e) => update("slug", e.target.value)} required /></label><label>Danh mục<input value={form.category} onChange={(e) => update("category", e.target.value)} required /></label><label>Giá (VND)<input type="number" min="0" step="1" value={form.price} onChange={(e) => update("price", e.target.value)} required /></label><label>Mô tả ngắn<textarea value={form.short_description} onChange={(e) => update("short_description", e.target.value)} /></label><label>Mô tả<textarea value={form.description} onChange={(e) => update("description", e.target.value)} /></label><label>Mô tả chi tiết<textarea value={form.long_description} onChange={(e) => update("long_description", e.target.value)} /></label><label>Trạng thái<select value={form.status} onChange={(e) => update("status", e.target.value as "draft" | "published")}><option value="draft">Bản nháp</option><option value="published">Đang hoạt động</option></select></label><label><input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} /> Active</label><label><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} /> Featured</label>{error && <div className="up-admin-error">{error}</div>}<button className="up-admin-primary" type="submit" disabled={saving}>{saving ? "ĐANG TẠO…" : "TẠO SẢN PHẨM"}</button></form></div>;
}
