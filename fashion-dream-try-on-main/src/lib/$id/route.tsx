import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProductVariant,
  deleteProductVariant,
  getProduct,
  listProductVariants,
  updateProductVariant,
  type Product,
  type ProductVariant,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/$id/")({
  component: ProductDetailPage,
  head: () => ({
    meta: [{ title: "Product Detail — UpThink" }],
  }),
});

type VariantForm = {
  size: string;
  color: string;
  sku: string;
  stock: string;
};

const emptyVariant: VariantForm = {
  size: "",
  color: "",
  sku: "",
  stock: "0",
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function ProductDetailPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [form, setForm] = useState<VariantForm>(emptyVariant);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productData, variantData] = await Promise.all([
        getProduct(id),
        listProductVariants(id),
      ]);

      if (!productData) {
        setProduct(null);
        setVariants([]);
        setError("Không tìm thấy sản phẩm.");
        return;
      }

      setProduct(productData);
      setVariants(variantData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalStock = useMemo(
    () => variants.reduce((sum, variant) => sum + variant.stock, 0),
    [variants],
  );

  function resetForm() {
    setEditing(null);
    setForm(emptyVariant);
    setMessage("");
  }

  function startEdit(variant: ProductVariant) {
    setEditing(variant);
    setForm({
      size: variant.size,
      color: variant.color,
      sku: variant.sku ?? "",
      stock: String(variant.stock),
    });
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const size = form.size.trim();
    const color = form.color.trim();
    const sku = form.sku.trim();
    const stock = Number(form.stock);

    if (!size || !color) {
      setMessage("Size và Color là bắt buộc.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setMessage("Stock phải là số nguyên từ 0 trở lên.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      if (editing) {
        await updateProductVariant(editing.id, {
          size,
          color,
          sku: sku || null,
          stock,
        });
        setMessage("Đã cập nhật variant.");
      } else {
        await createProductVariant({
          product_id: id,
          size,
          color,
          sku: sku || null,
          stock,
        });
        setMessage("Đã tạo variant.");
      }
      resetForm();
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu variant.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variant: ProductVariant) {
    if (!window.confirm(`Xóa variant ${variant.size} / ${variant.color}?`)) return;

    setSaving(true);
    setError("");
    setMessage("");
    try {
      await deleteProductVariant(variant.id);
      if (editing?.id === variant.id) resetForm();
      setMessage("Đã xóa variant.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa variant.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="up-admin-empty">Đang tải thông tin sản phẩm…</div>;
  }

  if (!product) {
    return (
      <div>
        <header className="up-admin-topbar">
          <div>
            <div className="up-admin-kicker">CATALOG / PRODUCT</div>
            <h1>Không tìm thấy sản phẩm</h1>
            <p>{error || "Sản phẩm không tồn tại hoặc đã bị xóa."}</p>
          </div>
          <Link className="up-admin-primary" to="/admin/products">← SẢN PHẨM</Link>
        </header>
      </div>
    );
  }

  return (
    <div>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">CATALOG / PRODUCT DETAIL</div>
          <h1>{product.name}</h1>
          <p>{product.slug} · {money(product.price)}</p>
        </div>
        <Link className="up-admin-primary" to="/admin/products">← SẢN PHẨM</Link>
      </header>

      {error && <div className="up-admin-empty" role="alert">{error}</div>}
      {message && <div className="up-admin-empty" role="status">{message}</div>}

      <section className="up-admin-stats">
        <div><span>VARIANTS</span><strong>{variants.length}</strong></div>
        <div><span>TỔNG TỒN KHO</span><strong>{totalStock}</strong></div>
        <div><span>TRẠNG THÁI</span><strong>{product.status}</strong></div>
        <div><span>SKU</span><strong>{variants.filter((variant) => variant.sku).length}</strong></div>
      </section>

      <section className="up-admin-table-wrap" style={{ marginBottom: 24 }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--border, #e5e7eb)" }}>
          <h2 style={{ margin: 0 }}>{editing ? "Sửa variant" : "Thêm variant"}</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.65 }}>Quản lý Size, Color, SKU và Stock cho sản phẩm này.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr)) auto", gap: 12, padding: 20 }}>
          <label>
            <span>SIZE</span>
            <input value={form.size} onChange={(e) => setForm((current) => ({ ...current, size: e.target.value }))} placeholder="S / M / L" disabled={saving} />
          </label>
          <label>
            <span>COLOR</span>
            <input value={form.color} onChange={(e) => setForm((current) => ({ ...current, color: e.target.value }))} placeholder="Black" disabled={saving} />
          </label>
          <label>
            <span>SKU</span>
            <input value={form.sku} onChange={(e) => setForm((current) => ({ ...current, sku: e.target.value }))} placeholder="FD-TEE-BLK-M" disabled={saving} />
          </label>
          <label>
            <span>STOCK</span>
            <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))} disabled={saving} />
          </label>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button className="up-admin-primary" type="submit" disabled={saving}>{saving ? "ĐANG LƯU…" : editing ? "LƯU" : "THÊM"}</button>
            {editing && <button className="up-row-action" type="button" onClick={resetForm} disabled={saving}>HỦY</button>}
          </div>
        </form>
      </section>

      <section className="up-admin-table-wrap">
        <table className="up-admin-table">
          <thead>
            <tr><th>SIZE</th><th>COLOR</th><th>SKU</th><th>STOCK</th><th>CẬP NHẬT</th><th></th></tr>
          </thead>
          <tbody>
            {variants.length ? variants.map((variant) => (
              <tr key={variant.id}>
                <td><strong>{variant.size}</strong></td>
                <td>{variant.color}</td>
                <td>{variant.sku || "—"}</td>
                <td><strong>{variant.stock}</strong></td>
                <td>{new Date(variant.created_at).toLocaleDateString("vi-VN")}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="up-row-action" onClick={() => startEdit(variant)} disabled={saving}>SỬA</button>
                    <button className="up-row-action" onClick={() => void handleDelete(variant)} disabled={saving}>XÓA</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="up-admin-empty">Sản phẩm chưa có variant nào.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
