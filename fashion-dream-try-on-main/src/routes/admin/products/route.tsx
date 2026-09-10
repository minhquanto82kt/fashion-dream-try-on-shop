// Admin products route
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addProductImage,
  deleteProduct,
  listProducts,
  updateProduct,
  uploadProductImage,
  type Product,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/")({
  component: ProductAdminPage,
  head: () => ({
    meta: [{ title: "Sản phẩm — Admin" }],
  }),
});

const categories = [
  "hoodies",
  "tees",
  "outerwear",
  "pants",
  "cap",
  "sunglass",
  "accessories",
];

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
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Chỉ giữ editor cho chức năng SỬA.
  // Chức năng THÊM đã được chuyển sang /admin/products/new.
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);

      try {
        const data = await listProducts();

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách sản phẩm.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const text =
        `${product.name} ${product.slug}`.toLowerCase();

      return (
        (!query ||
          text.includes(query.toLowerCase())) &&
        (statusFilter === "all" ||
          product.status === statusFilter) &&
        (categoryFilter === "all" ||
          product.category === categoryFilter)
      );
    });
  }, [
    products,
    query,
    statusFilter,
    categoryFilter,
  ]);

  function resetEditor() {
    setEditing(null);
    setForm({ ...emptyForm });
    setMessage("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function openEdit(product: Product) {
    setEditing(product);

    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: String(product.price),
      short_description:
        product.short_description || "",
      long_description:
        product.long_description ||
        product.description ||
        "",
      image: product.image || "",
      status: product.status,
      featured: product.featured,
    });

    setMessage("");
  }

  async function handleSave(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!editing) {
      return;
    }

    if (!form.name.trim()) {
      setMessage("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!form.slug.trim()) {
      setMessage("Vui lòng nhập slug.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setMessage("Giá không hợp lệ.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category,
        price,
        short_description:
          form.short_description.trim() || null,
        long_description:
          form.long_description.trim() || null,
        description:
          form.long_description.trim() ||
          form.short_description.trim() ||
          null,
        image: form.image || null,
        status: form.status,
        active: form.status === "published",
        featured: form.featured,
      };

      await updateProduct(editing.id, payload);

      setProducts(await listProducts());

      setEditing((current) =>
        current
          ? {
              ...current,
              ...payload,
              short_description:
                payload.short_description || "",
              long_description:
                payload.long_description || "",
              description:
                payload.description || "",
              image: payload.image || "",
            }
          : null,
      );

      setMessage("Đã cập nhật sản phẩm.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật sản phẩm.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (
      !window.confirm(
        `Xóa "${product.name}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteProduct(product.id);

      setProducts(await listProducts());

      if (editing?.id === product.id) {
        resetEditor();
      } else {
        setMessage("Đã xóa sản phẩm.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể xóa sản phẩm.",
      );
    }
  }

  async function handleImageUpload(file?: File) {
    if (!file) {
      return;
    }

    if (!editing?.id) {
      setMessage(
        "Không xác định được sản phẩm cần cập nhật ảnh.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const url = await uploadProductImage(
        editing.id,
        file,
      );

      await addProductImage(
        editing.id,
        url,
        true,
      );

      await updateProduct(editing.id, {
        image: url,
      });

      setForm((current) => ({
        ...current,
        image: url,
      }));

      setEditing((current) =>
        current
          ? {
              ...current,
              image: url,
            }
          : null,
      );

      setProducts(await listProducts());

      setMessage("Đã tải ảnh lên.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Upload ảnh thất bại.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">
            DANH MỤC / QUẢN TRỊ
          </div>

          <h1>Sản phẩm</h1>

          <p>
            Quản lý sản phẩm của cửa hàng
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="up-admin-primary"
        >
          ＋ THÊM SẢN PHẨM
        </Link>
      </header>

      <section className="up-admin-toolbar">
        <input
          placeholder="⌕  Tìm kiếm sản phẩm…"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            Tất cả trạng thái
          </option>

          <option value="published">
            Đang hoạt động
          </option>

          <option value="draft">
            Bản nháp
          </option>

          <option value="archived">
            Đã ẩn
          </option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="all">
            Tất cả danh mục
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>
      </section>

      <section className="up-admin-stats">
        <div>
          <span>TỔNG SẢN PHẨM</span>

          <strong>
            {products.length}
          </strong>
        </div>

        <div>
          <span>ĐANG BÁN</span>

          <strong>
            {
              products.filter(
                (p) =>
                  p.status === "published",
              ).length
            }
          </strong>
        </div>

        <div>
          <span>BẢN NHÁP</span>

          <strong>
            {
              products.filter(
                (p) =>
                  p.status === "draft",
              ).length
            }
          </strong>
        </div>

        <div>
          <span>NỔI BẬT</span>

          <strong>
            {
              products.filter(
                (p) => p.featured,
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="up-admin-table-wrap">
        <table className="up-admin-table">
          <thead>
            <tr>
              <th>SẢN PHẨM</th>
              <th>DANH MỤC</th>
              <th>GIÁ</th>
              <th>TRẠNG THÁI</th>
              <th>NỔI BẬT</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="up-admin-empty"
                >
                  Đang tải sản phẩm…
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="up-product-cell">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <div className="up-product-placeholder">
                          U
                        </div>
                      )}

                      <div>
                        <strong>
                          {product.name}
                        </strong>

                        <small>
                          /{product.slug}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>{product.category}</td>

                  <td>
                    <strong>
                      {money(product.price)}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`up-status ${product.status}`}
                    >
                      {product.status ===
                      "published"
                        ? "Đang hoạt động"
                        : product.status ===
                            "draft"
                          ? "Bản nháp"
                          : "Đã ẩn"}
                    </span>
                  </td>

                  <td>
                    {product.featured
                      ? "●"
                      : "—"}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="up-row-action"
                      onClick={() =>
                        openEdit(product)
                      }
                    >
                      SỬA
                    </button>
                  </td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>

        {!loading &&
          !filtered.length && (
            <div className="up-admin-empty">
              Không có sản phẩm phù hợp.
            </div>
          )}
      </section>

      {message && (
        <div className="up-admin-toast">
          {message}
        </div>
      )}

      {editing && (
        <section className="up-admin-editor">
          <div className="up-editor-head">
            <div>
              <div className="up-admin-kicker">
                CHỈNH SỬA SẢN PHẨM
              </div>

              <h2>
                {editing.name}
              </h2>
            </div>

            <button
              type="button"
              className="up-icon-btn"
              onClick={resetEditor}
              aria-label="Đóng trình chỉnh sửa"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="up-editor-grid"
          >
            <div className="up-editor-left">
              <label>
                Tên sản phẩm

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  onBlur={() => {
                    if (!form.slug) {
                      setForm((current) => ({
                        ...current,
                        slug: slugify(
                          current.name,
                        ),
                      }));
                    }
                  }}
                />
              </label>

              <label>
                Slug

                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
                  }
                />
              </label>

              <div className="up-two-col">
                <label>
                  Danh mục

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category:
                          e.target.value,
                      })
                    }
                  >
                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Giá (VND)

                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price:
                          e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Mô tả ngắn

                <textarea
                  rows={3}
                  value={
                    form.short_description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      short_description:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Mô tả chi tiết

                <textarea
                  rows={7}
                  value={
                    form.long_description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      long_description:
                        e.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="up-editor-right">
              <div
                className="up-upload-card"
                onClick={() =>
                  fileRef.current?.click()
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    fileRef.current?.click();
                  }
                }}
              >
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Xem trước sản phẩm"
                  />
                ) : (
                  <div>
                    <b>＋</b>

                    <span>
                      TẢI ẢNH SẢN PHẨM
                    </span>

                    <small>
                      PNG, JPG, WEBP
                    </small>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    void handleImageUpload(
                      e.target.files?.[0],
                    )
                  }
                />
              </div>

              <label>
                Trạng thái

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target.value as Product["status"],
                    })
                  }
                >
                  <option value="draft">
                    Bản nháp
                  </option>

                  <option value="published">
                    Đang hoạt động
                  </option>

                  <option value="archived">
                    Đã ẩn
                  </option>
                </select>
              </label>

              <label className="up-check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featured:
                        e.target.checked,
                    })
                  }
                />

                Sản phẩm nổi bật
              </label>

              <div className="up-editor-actions">
                <button
                  type="button"
                  className="up-danger"
                  onClick={() =>
                    void handleDelete(
                      editing,
                    )
                  }
                  disabled={saving}
                >
                  XÓA
                </button>

                <button
                  type="button"
                  className="up-secondary"
                  onClick={resetEditor}
                  disabled={saving}
                >
                  HỦY
                </button>

                <button
                  type="submit"
                  className="up-admin-primary"
                  disabled={saving}
                >
                  {saving
                    ? "ĐANG LƯU…"
                    : "LƯU THAY ĐỔI"}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
