import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProductVariant,
  deleteProduct,
  deleteProductVariant,
  getProduct,
  listProductVariants,
  updateProduct,
  updateProductVariant,
  type Product,
  type ProductVariant,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/$id/")({
  component: ProductDetailPage,
  head: () => ({ meta: [{ title: "Product Detail — UpThink" }] }),
});

type ProductForm = {
  name: string;
  slug: string;
  category: string;
  price: string;
  short_description: string;
  long_description: string;
  status: Product["status"];
  featured: boolean;
};

type VariantForm = {
  size: string;
  color: string;
  sku: string;
  stock: string;
};

const categories = ["hoodies", "tees", "outerwear", "pants", "cap", "sunglass", "accessories"];
const sizes = ["S", "M", "L", "XL", "Freesize"];
const colors = ["Black", "White", "Beige", "Ivory", "Charcoal", "Cement", "Moss", "Electric"];
const emptyVariant: VariantForm = { size: "", color: "", sku: "", stock: "0" };

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function colorValue(color: string) {
  const values: Record<string, string> = {
    Black: "#111111",
    White: "#ffffff",
    Beige: "#d8c2a4",
    Ivory: "#f4f0df",
    Charcoal: "#4b4b4b",
    Cement: "#8b8b83",
    Moss: "#68745b",
    Electric: "#3155ff",
  };
  return values[color] ?? "#b5b5b5";
}

function stockMeta(stock: number) {
  if (stock === 0) return { label: "HẾT HÀNG", className: "out" };
  if (stock <= 5) return { label: "SẮP HẾT", className: "low" };
  return { label: "CÒN HÀNG", className: "in" };
}

function ProductDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState<VariantForm>(emptyVariant);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productData, variantData] = await Promise.all([getProduct(id), listProductVariants(id)]);
      if (!productData) {
        setProduct(null);
        setForm(null);
        setVariants([]);
        setError("Không tìm thấy sản phẩm.");
        return;
      }
      setProduct(productData);
      setVariants(variantData);
      setForm({
        name: productData.name,
        slug: productData.slug,
        category: productData.category,
        price: String(productData.price),
        short_description: productData.short_description ?? "",
        long_description: productData.long_description ?? "",
        status: productData.status,
        featured: productData.featured,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const inventory = useMemo(() => {
    const low = variants.filter((variant) => variant.stock > 0 && variant.stock <= 5).length;
    const out = variants.filter((variant) => variant.stock === 0).length;
    return { total: variants.reduce((sum, variant) => sum + variant.stock, 0), low, out };
  }, [variants]);

  const statusLabel = product?.status === "published" ? "Đang hoạt động" : product?.status === "draft" ? "Bản nháp" : "Đã ẩn";

  function resetVariantForm() {
    setEditingVariant(null);
    setVariantForm(emptyVariant);
  }

  function startEditVariant(variant: ProductVariant) {
    setEditingVariant(variant);
    setVariantForm({ size: variant.size, color: variant.color, sku: variant.sku ?? "", stock: String(variant.stock) });
    setMessage("");
    setError("");
  }

  async function handleProductSave(event: React.FormEvent) {
    event.preventDefault();
    if (!product || !form) return;
    const name = form.name.trim();
    const slug = form.slug.trim();
    const price = Number(form.price);
    if (!name) return setError("Vui lòng nhập tên sản phẩm.");
    if (!slug) return setError("Vui lòng nhập slug.");
    if (!Number.isFinite(price) || price < 0) return setError("Giá sản phẩm không hợp lệ.");

    setSaving(true); setMessage(""); setError("");
    try {
      const updated = await updateProduct(product.id, {
        name,
        slug,
        category: form.category,
        price,
        short_description: form.short_description.trim() || null,
        long_description: form.long_description.trim() || null,
        description: form.long_description.trim() || form.short_description.trim() || null,
        status: form.status,
        active: form.status === "published",
        featured: form.featured,
      });
      setProduct(updated ?? { ...product, name, slug, category: form.category, price, status: form.status, featured: form.featured });
      setMessage("Đã cập nhật sản phẩm.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật sản phẩm.");
    } finally { setSaving(false); }
  }

  async function handleProductDelete() {
    if (!product) return;
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?\n\nSupabase có thể từ chối nếu dữ liệu liên quan không cho phép xóa.`)) return;
    setDeleting(true); setMessage(""); setError("");
    try {
      await deleteProduct(product.id);
      await navigate({ to: "/admin/products" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa sản phẩm.");
    } finally { setDeleting(false); }
  }

  async function handleVariantSubmit(event: React.FormEvent) {
    event.preventDefault();
    const size = variantForm.size.trim();
    const color = variantForm.color.trim();
    const sku = variantForm.sku.trim();
    const stock = Number(variantForm.stock);
    if (!size) return setError("Vui lòng chọn Size.");
    if (!color) return setError("Vui lòng chọn Color.");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stock phải là số nguyên từ 0 trở lên.");

    setSaving(true); setMessage(""); setError("");
    try {
      if (editingVariant) {
        await updateProductVariant(editingVariant.id, { size, color, sku: sku || null, stock });
        setMessage("Đã cập nhật variant và tồn kho.");
      } else {
        await createProductVariant({ product_id: id, size, color, sku: sku || null, stock });
        setMessage("Đã tạo variant.");
      }
      resetVariantForm();
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu variant.");
    } finally { setSaving(false); }
  }

  async function handleVariantDelete(variant: ProductVariant) {
    if (!window.confirm(`Xóa variant ${variant.size} / ${variant.color}?`)) return;
    setSaving(true); setMessage(""); setError("");
    try {
      await deleteProductVariant(variant.id);
      if (editingVariant?.id === variant.id) resetVariantForm();
      setMessage("Đã xóa variant.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa variant.");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="up-admin-empty">Đang tải thông tin sản phẩm…</div>;

  if (!product || !form) {
    return <div><header className="up-admin-topbar"><div><div className="up-admin-kicker">CATALOG / PRODUCT</div><h1>Không tìm thấy sản phẩm</h1><p>{error || "Sản phẩm không tồn tại."}</p></div><Link className="up-admin-primary" to="/admin/products">← SẢN PHẨM</Link></header></div>;
  }

  return (
    <div>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">CATALOG / PRODUCT DETAIL</div>
          <h1>{product.name}</h1>
          <p>{product.slug} · {money(product.price)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link className="up-admin-secondary" to="/admin/products">← SẢN PHẨM</Link>
          <Link className="up-admin-primary" to="/product/$id" params={{ id: product.id }}>XEM TRÊN CỬA HÀNG ↗</Link>
        </div>
      </header>

      {error && <div className="up-admin-toast" role="alert">{error}</div>}
      {message && <div className="up-admin-toast" role="status">{message}</div>}

      <section className="up-admin-editor">
        <div className="up-editor-head">
          <div><div className="up-admin-kicker">PRODUCT INFORMATION</div><h2>Thông tin sản phẩm</h2><p>READ / UPDATE dữ liệu sản phẩm hiện tại.</p></div>
          <span className={`up-status ${product.status}`}>{statusLabel}</span>
        </div>
        <div className="up-editor-grid">
          <div className="up-editor-left">
            <div className="up-upload-card">
              {product.image ? <img src={product.image} alt={product.name} /> : <div><b>NO IMAGE</b><span>Sản phẩm chưa có ảnh</span></div>}
            </div>
          </div>
          <form className="up-editor-right" onSubmit={handleProductSave}>
            <label>Tên sản phẩm<input value={form.name} onChange={(e) => setForm((c) => c && ({ ...c, name: e.target.value }))} disabled={saving || deleting} /></label>
            <label>Slug<input value={form.slug} onChange={(e) => setForm((c) => c && ({ ...c, slug: e.target.value }))} disabled={saving || deleting} /></label>
            <div className="up-two-col">
              <label>Danh mục<select value={form.category} onChange={(e) => setForm((c) => c && ({ ...c, category: e.target.value }))} disabled={saving || deleting}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Giá (VND)<input type="number" min="0" value={form.price} onChange={(e) => setForm((c) => c && ({ ...c, price: e.target.value }))} disabled={saving || deleting} /></label>
            </div>
            <label>Mô tả ngắn<textarea rows={3} value={form.short_description} onChange={(e) => setForm((c) => c && ({ ...c, short_description: e.target.value }))} disabled={saving || deleting} /></label>
            <label>Mô tả chi tiết<textarea rows={7} value={form.long_description} onChange={(e) => setForm((c) => c && ({ ...c, long_description: e.target.value }))} disabled={saving || deleting} /></label>
            <label>Trạng thái<select value={form.status} onChange={(e) => setForm((c) => c && ({ ...c, status: e.target.value as Product["status"] }))} disabled={saving || deleting}><option value="draft">Bản nháp</option><option value="published">Đang hoạt động</option><option value="archived">Đã ẩn</option></select></label>
            <label className="up-check"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((c) => c && ({ ...c, featured: e.target.checked }))} disabled={saving || deleting} />Sản phẩm nổi bật</label>
            <div className="up-editor-actions">
              <Link className="up-secondary" to="/admin/products">HỦY</Link>
              <button className="up-admin-primary" type="submit" disabled={saving || deleting}>{saving ? "ĐANG LƯU…" : "LƯU THAY ĐỔI"}</button>
              <button className="up-row-action up-row-action-danger" type="button" onClick={() => void handleProductDelete()} disabled={saving || deleting}>{deleting ? "ĐANG XÓA…" : "XÓA SẢN PHẨM"}</button>
            </div>
          </form>
        </div>
      </section>

      <section className="up-admin-stats">
        <div><span>VARIANTS</span><strong>{variants.length}</strong></div>
        <div><span>TỔNG TỒN KHO</span><strong>{inventory.total}</strong></div>
        <div><span>SẮP HẾT</span><strong>{inventory.low}</strong></div>
        <div><span>HẾT HÀNG</span><strong>{inventory.out}</strong></div>
      </section>

      <section className="up-admin-table-wrap" style={{ marginBottom: 24 }}>
        <div style={{ padding: 20, borderBottom: "1px solid #e5e7eb" }}>
          <div className="up-admin-kicker">INVENTORY / VARIANTS</div>
          <h2 style={{ margin: "4px 0 0" }}>{editingVariant ? "Chỉnh sửa variant" : "Thêm variant"}</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.65 }}>Chọn Size và Color từ bộ giá trị đang có trong kho; Stock là tồn kho thực tế của variant.</p>
        </div>

        <form onSubmit={handleVariantSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr)) auto", gap: 12, padding: 20 }}>
          <label>SIZE<select value={variantForm.size} onChange={(e) => setVariantForm((c) => ({ ...c, size: e.target.value }))} disabled={saving || deleting}><option value="">Chọn size</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
          <label>COLOR
            <select value={variantForm.color} onChange={(e) => setVariantForm((c) => ({ ...c, color: e.target.value }))} disabled={saving || deleting}>
              <option value="">Chọn màu</option>
              {colors.map((color) => <option key={color}>{color}</option>)}
            </select>
            {variantForm.color && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12 }}><i style={{ width: 14, height: 14, borderRadius: "50%", display: "inline-block", background: colorValue(variantForm.color), border: "1px solid #999" }} />{variantForm.color}</span>}
          </label>
          <label>SKU<input value={variantForm.sku} onChange={(e) => setVariantForm((c) => ({ ...c, sku: e.target.value }))} placeholder="FD-TEE-BLK-M" disabled={saving || deleting} /></label>
          <label>STOCK<input type="number" min="0" step="1" value={variantForm.stock} onChange={(e) => setVariantForm((c) => ({ ...c, stock: e.target.value }))} disabled={saving || deleting} /></label>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button className="up-admin-primary" type="submit" disabled={saving || deleting}>{saving ? "ĐANG LƯU…" : editingVariant ? "LƯU" : "THÊM"}</button>
            {editingVariant && <button className="up-row-action" type="button" onClick={resetVariantForm} disabled={saving || deleting}>HỦY</button>}
          </div>
        </form>
      </section>

      <section className="up-admin-table-wrap">
        <table className="up-admin-table">
          <thead><tr><th>SIZE</th><th>COLOR</th><th>SKU</th><th>STOCK</th><th>TRẠNG THÁI</th><th></th></tr></thead>
          <tbody>
            {variants.length ? variants.map((variant) => {
              const meta = stockMeta(variant.stock);
              return <tr key={variant.id}>
                <td><strong>{variant.size}</strong></td>
                <td><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><i style={{ width: 16, height: 16, borderRadius: "50%", display: "inline-block", background: colorValue(variant.color), border: "1px solid #999" }} />{variant.color}</span></td>
                <td>{variant.sku || "—"}</td>
                <td><strong>{variant.stock}</strong></td>
                <td><span className={`up-status ${meta.className}`}>{meta.label}</span></td>
                <td><div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button className="up-row-action" onClick={() => startEditVariant(variant)} disabled={saving || deleting}>SỬA</button><button className="up-row-action up-row-action-danger" onClick={() => void handleVariantDelete(variant)} disabled={saving || deleting}>XÓA</button></div></td>
              </tr>;
            }) : <tr><td colSpan={6} className="up-admin-empty">Sản phẩm chưa có variant nào.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
