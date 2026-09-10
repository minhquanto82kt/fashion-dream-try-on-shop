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
  head: () => ({
    meta: [{ title: "Product Detail — UpThink" }],
  }),
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

const categories = [
  "hoodies",
  "tees",
  "outerwear",
  "pants",
  "cap",
  "sunglass",
  "accessories",
];

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
      const [productData, variantData] = await Promise.all([
        getProduct(id),
        listProductVariants(id),
      ]);

      if (!productData) {
        setProduct(null);
        setVariants([]);
        setForm(null);
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
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể tải dữ liệu sản phẩm.",
      );
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

  const statusLabel =
    product?.status === "published"
      ? "Đang hoạt động"
      : product?.status === "draft"
        ? "Bản nháp"
        : "Đã ẩn";

  function resetVariantForm() {
    setEditingVariant(null);
    setVariantForm(emptyVariant);
  }

  function startEditVariant(variant: ProductVariant) {
    setEditingVariant(variant);
    setVariantForm({
      size: variant.size,
      color: variant.color,
      sku: variant.sku ?? "",
      stock: String(variant.stock),
    });
    setMessage("");
    setError("");
  }

  async function handleProductSave(event: React.FormEvent) {
    event.preventDefault();
    if (!product || !form) return;

    const name = form.name.trim();
    const slug = form.slug.trim();
    const price = Number(form.price);
    const shortDescription = form.short_description.trim();
    const longDescription = form.long_description.trim();

    if (!name) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!slug) {
      setError("Vui lòng nhập slug.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Giá sản phẩm không hợp lệ.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await updateProduct(product.id, {
        name,
        slug,
        category: form.category,
        price,
        short_description: shortDescription || null,
        long_description: longDescription || null,
        description: longDescription || shortDescription || null,
        status: form.status,
        active: form.status === "published",
        featured: form.featured,
      });

      setProduct(updated ?? { ...product, ...form, price });
      setMessage("Đã cập nhật sản phẩm.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể cập nhật sản phẩm.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleProductDelete() {
    if (!product) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?\n\nNếu sản phẩm đang có variant hoặc dữ liệu đơn hàng liên quan, Supabase có thể từ chối thao tác để bảo vệ tính toàn vẹn dữ liệu.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage("");
    setError("");

    try {
      await deleteProduct(product.id);
      await navigate({ to: "/admin/products" });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể xóa sản phẩm.",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleVariantSubmit(event: React.FormEvent) {
    event.preventDefault();

    const size = variantForm.size.trim();
    const color = variantForm.color.trim();
    const sku = variantForm.sku.trim();
    const stock = Number(variantForm.stock);

    if (!size || !color) {
      setError("Size và Color là bắt buộc.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock phải là số nguyên từ 0 trở lên.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingVariant) {
        await updateProductVariant(editingVariant.id, {
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

      resetVariantForm();
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể lưu variant.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleVariantDelete(variant: ProductVariant) {
    if (!window.confirm(`Xóa variant ${variant.size} / ${variant.color}?`)) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await deleteProductVariant(variant.id);
      if (editingVariant?.id === variant.id) {
        resetVariantForm();
      }
      setMessage("Đã xóa variant.");
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể xóa variant.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="up-admin-empty">Đang tải thông tin sản phẩm…</div>;
  }

  if (!product || !form) {
    return (
      <div>
        <header className="up-admin-topbar">
          <div>
            <div className="up-admin-kicker">CATALOG / PRODUCT</div>
            <h1>Không tìm thấy sản phẩm</h1>
            <p>{error || "Sản phẩm không tồn tại hoặc đã bị xóa."}</p>
          </div>
          <Link className="up-admin-primary" to="/admin/products">
            ← SẢN PHẨM
          </Link>
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link className="up-admin-secondary" to="/admin/products">
            ← SẢN PHẨM
          </Link>
          <Link
            className="up-admin-primary"
            to="/product/$id"
            params={{ id: product.id }}
          >
            XEM TRÊN CỬA HÀNG ↗
          </Link>
        </div>
      </header>

      {error && (
        <div className="up-admin-toast" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="up-admin-toast" role="status">
          {message}
        </div>
      )}

      <section className="up-admin-editor">
        <div className="up-editor-head">
          <div>
            <div className="up-admin-kicker">PRODUCT INFORMATION</div>
            <h2>Thông tin sản phẩm</h2>
            <p>READ / UPDATE dữ liệu sản phẩm hiện tại.</p>
          </div>

          <span className={`up-status ${product.status}`}>
            {statusLabel}
          </span>
        </div>

        <div className="up-editor-grid">
          <div className="up-editor-left">
            <div className="up-upload-card">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div>
                  <b>NO IMAGE</b>
                  <span>Sản phẩm chưa có ảnh</span>
                </div>
              )}
            </div>
            <p style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
              Ảnh hiện tại của sản phẩm. Upload/thay ảnh sẽ xử lý ở bước media tiếp theo.
            </p>
          </div>

          <form className="up-editor-right" onSubmit={handleProductSave}>
            <label>
              Tên sản phẩm
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => current && ({ ...current, name: event.target.value }))
                }
                disabled={saving || deleting}
              />
            </label>

            <label>
              Slug
              <input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => current && ({ ...current, slug: event.target.value }))
                }
                disabled={saving || deleting}
              />
            </label>

            <div className="up-two-col">
              <label>
                Danh mục
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => current && ({ ...current, category: event.target.value }))
                  }
                  disabled={saving || deleting}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Giá (VND)
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => current && ({ ...current, price: event.target.value }))
                  }
                  disabled={saving || deleting}
                />
              </label>
            </div>

            <label>
              Mô tả ngắn
              <textarea
                rows={3}
                value={form.short_description}
                onChange={(event) =>
                  setForm((current) =>
                    current && ({ ...current, short_description: event.target.value }),
                  )
                }
                disabled={saving || deleting}
              />
            </label>

            <label>
              Mô tả chi tiết
              <textarea
                rows={7}
                value={form.long_description}
                onChange={(event) =>
                  setForm((current) =>
                    current && ({ ...current, long_description: event.target.value }),
                  )
                }
                disabled={saving || deleting}
              />
            </label>

            <label>
              Trạng thái
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) =>
                    current && ({
                      ...current,
                      status: event.target.value as Product["status"],
                    }),
                  )
                }
                disabled={saving || deleting}
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đang hoạt động</option>
                <option value="archived">Đã ẩn</option>
              </select>
            </label>

            <label className="up-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm((current) =>
                    current && ({ ...current, featured: event.target.checked }),
                  )
                }
                disabled={saving || deleting}
              />
              Sản phẩm nổi bật
            </label>

            <div className="up-editor-actions">
              <Link className="up-secondary" to="/admin/products">
                HỦY
              </Link>
              <button className="up-admin-primary" type="submit" disabled={saving || deleting}>
                {saving ? "ĐANG LƯU…" : "LƯU THAY ĐỔI"}
              </button>
              <button
                className="up-row-action up-row-action-danger"
                type="button"
                onClick={() => void handleProductDelete()}
                disabled={saving || deleting}
              >
                {deleting ? "ĐANG XÓA…" : "XÓA SẢN PHẨM"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="up-admin-stats">
        <div>
          <span>VARIANTS</span>
          <strong>{variants.length}</strong>
        </div>
        <div>
          <span>TỔNG TỒN KHO</span>
          <strong>{totalStock}</strong>
        </div>
        <div>
          <span>TRẠNG THÁI</span>
          <strong>{statusLabel}</strong>
        </div>
        <div>
          <span>SKU</span>
          <strong>{variants.filter((variant) => variant.sku).length}</strong>
        </div>
      </section>

      <section className="up-admin-table-wrap" style={{ marginBottom: 24 }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--border, #e5e7eb)" }}>
          <h2 style={{ margin: 0 }}>{editingVariant ? "Sửa variant" : "Thêm variant"}</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.65 }}>
            Quản lý Size, Color, SKU và Stock cho sản phẩm này.
          </p>
        </div>

        <form
          onSubmit={handleVariantSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr)) auto",
            gap: 12,
            padding: 20,
          }}
        >
          <label>
            <span>SIZE</span>
            <input
              value={variantForm.size}
              onChange={(event) =>
                setVariantForm((current) => ({ ...current, size: event.target.value }))
              }
              placeholder="S / M / L"
              disabled={saving || deleting}
            />
          </label>
          <label>
            <span>COLOR</span>
            <input
              value={variantForm.color}
              onChange={(event) =>
                setVariantForm((current) => ({ ...current, color: event.target.value }))
              }
              placeholder="Black"
              disabled={saving || deleting}
            />
          </label>
          <label>
            <span>SKU</span>
            <input
              value={variantForm.sku}
              onChange={(event) =>
                setVariantForm((current) => ({ ...current, sku: event.target.value }))
              }
              placeholder="FD-TEE-BLK-M"
              disabled={saving || deleting}
            />
          </label>
          <label>
            <span>STOCK</span>
            <input
              type="number"
              min="0"
              step="1"
              value={variantForm.stock}
              onChange={(event) =>
                setVariantForm((current) => ({ ...current, stock: event.target.value }))
              }
              disabled={saving || deleting}
            />
          </label>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button className="up-admin-primary" type="submit" disabled={saving || deleting}>
              {saving ? "ĐANG LƯU…" : editingVariant ? "LƯU" : "THÊM"}
            </button>
            {editingVariant && (
              <button
                className="up-row-action"
                type="button"
                onClick={resetVariantForm}
                disabled={saving || deleting}
              >
                HỦY
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="up-admin-table-wrap">
        <table className="up-admin-table">
          <thead>
            <tr>
              <th>SIZE</th>
              <th>COLOR</th>
              <th>SKU</th>
              <th>STOCK</th>
              <th>CẬP NHẬT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {variants.length ? (
              variants.map((variant) => (
                <tr key={variant.id}>
                  <td><strong>{variant.size}</strong></td>
                  <td>{variant.color}</td>
                  <td>{variant.sku || "—"}</td>
                  <td><strong>{variant.stock}</strong></td>
                  <td>{new Date(variant.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button
                        className="up-row-action"
                        onClick={() => startEditVariant(variant)}
                        disabled={saving || deleting}
                      >
                        SỬA
                      </button>
                      <button
                        className="up-row-action up-row-action-danger"
                        onClick={() => void handleVariantDelete(variant)}
                        disabled={saving || deleting}
                      >
                        XÓA
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="up-admin-empty">
                  Sản phẩm chưa có variant nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
