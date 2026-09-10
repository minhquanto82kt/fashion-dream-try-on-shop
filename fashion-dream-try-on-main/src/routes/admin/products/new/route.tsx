import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  addProductImage,
  createProduct,
  updateProduct,
  uploadProductImage,
  type Product,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/new/")({
  component: NewProductPage,
  head: () => ({
    meta: [{ title: "Add Product — UpThink" }],
  }),
});

const categories = ["hoodies", "tees", "outerwear", "pants", "cap", "sunglass", "accessories"];

const emptyForm = {
  name: "",
  slug: "",
  category: "tees",
  price: "0",
  short_description: "",
  long_description: "",
  status: "draft" as Product["status"],
  featured: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NewProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("File ảnh không hợp lệ.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Ảnh phải nhỏ hơn hoặc bằng 10 MB.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setMessage("Vui lòng nhập tên sản phẩm.");

    const slug = form.slug.trim() || slugify(form.name);
    const price = Number(form.price);
    if (!slug) return setMessage("Vui lòng nhập slug.");
    if (!Number.isFinite(price) || price < 0) return setMessage("Giá không hợp lệ.");

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        slug,
        category: form.category,
        price,
        short_description: form.short_description.trim() || null,
        long_description: form.long_description.trim() || null,
        description: form.long_description.trim() || form.short_description.trim() || null,
        image: null,
        status: form.status,
        active: form.status === "published",
        featured: form.featured,
      };

      const id = slugify(form.name) || `product-${Date.now()}`;
      const product = await createProduct({ id, ...payload });

      if (imageFile) {
        try {
          const url = await uploadProductImage(product.id, imageFile);
          await addProductImage(product.id, url, true);
          await updateProduct(product.id, { image: url });
        } catch (imageError) {
          setMessage(
            imageError instanceof Error
              ? `Đã tạo sản phẩm nhưng upload ảnh thất bại: ${imageError.message}`
              : "Đã tạo sản phẩm nhưng upload ảnh thất bại.",
          );
          return;
        }
      }

      await navigate({ to: "/admin/products" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tạo sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">CATALOG / CMS</div>
          <h1>Thêm sản phẩm</h1>
          <p>Tạo sản phẩm mới cho cửa hàng</p>
        </div>
        <Link className="up-admin-secondary" to="/admin/products">QUAY LẠI</Link>
      </header>

      {message && <div className="up-admin-toast">{message}</div>}

      <section className="up-admin-editor">
        <div className="up-editor-head">
          <div>
            <div className="up-admin-kicker">NEW PRODUCT</div>
            <h2>Thông tin sản phẩm</h2>
          </div>
        </div>

        <form onSubmit={handleSave} className="up-editor-grid">
          <div className="up-editor-left">
            <label>
              Tên sản phẩm
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={() => !form.slug && setForm((current) => ({ ...current, slug: slugify(current.name) }))}
              />
            </label>
            <label>
              Slug
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
            <div className="up-two-col">
              <label>
                Danh mục
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label>
                Giá (VND)
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </label>
            </div>
            <label>
              Mô tả ngắn
              <textarea rows={3} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </label>
            <label>
              Mô tả chi tiết
              <textarea rows={7} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} />
            </label>
          </div>

          <div className="up-editor-right">
            <div className="up-upload-card" onClick={() => fileRef.current?.click()}>
              {preview ? (
                <img src={preview} alt="Product preview" />
              ) : (
                <div><b>＋</b><span>TẢI ẢNH SẢN PHẨM</span><small>PNG, JPG, WEBP · tối đa 10 MB</small></div>
              )}
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => chooseImage(e.target.files?.[0])} />
            </div>
            <label>
              Trạng thái
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}>
                <option value="draft">Bản nháp</option>
                <option value="published">Đang hoạt động</option>
                <option value="archived">Đã ẩn</option>
              </select>
            </label>
            <label className="up-check">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Sản phẩm nổi bật
            </label>
            <div className="up-editor-actions">
              <Link className="up-secondary" to="/admin/products">HỦY</Link>
              <button type="submit" className="up-admin-primary" disabled={saving}>
                {saving ? "ĐANG TẠO…" : "TẠO SẢN PHẨM"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
