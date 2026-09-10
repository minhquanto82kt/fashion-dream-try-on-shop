import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  addProductImage,
  createProduct,
  updateProduct,
  uploadProductImage,
  type Product,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute(
  "/admin/products/new/",
)({
  component: NewProductPage,
  head: () => ({
    meta: [{ title: "Thêm sản phẩm — Admin" }],
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(file?: File) {
    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Ảnh không hợp lệ. Vui lòng chọn JPG, PNG, WEBP hoặc GIF.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage(
        "Ảnh vượt quá giới hạn 10 MB.",
      );
      return;
    }

    setMessage("");
    setImageFile(file);
  }

  async function handleSave(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Vui lòng nhập tên sản phẩm.");
      return;
    }

    const slug =
      form.slug.trim() || slugify(form.name);

    if (!slug) {
      setMessage(
        "Không thể tạo slug từ tên sản phẩm.",
      );
      return;
    }

    const price = Number(form.price);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setMessage("Giá sản phẩm không hợp lệ.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        slug,
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
        image: null,
        status: form.status,
        active: form.status === "published",
        featured: form.featured,
      };

      const id =
        slugify(form.name) ||
        `product-${Date.now()}`;

      const product = await createProduct({
        id,
        ...payload,
      });

      if (imageFile) {
        try {
          const url = await uploadProductImage(
            product.id,
            imageFile,
          );

          await addProductImage(
            product.id,
            url,
            true,
          );

          await updateProduct(product.id, {
            image: url,
          });
        } catch (imageError) {
          setMessage(
            imageError instanceof Error
              ? `Đã tạo sản phẩm nhưng tải ảnh thất bại: ${imageError.message}`
              : "Đã tạo sản phẩm nhưng tải ảnh thất bại.",
          );

          setSaving(false);
          return;
        }
      }

      await navigate({
        to: "/admin/products",
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo sản phẩm.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="up-admin-breadcrumb">
        <Link to="/admin/products">
          SẢN PHẨM
        </Link>

        <span>›</span>

        <strong>THÊM SẢN PHẨM</strong>
      </div>

      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">
            DANH MỤC / SẢN PHẨM
          </div>

          <h1>Thêm sản phẩm</h1>

          <p>
            Tạo một sản phẩm mới cho cửa hàng.
          </p>
        </div>
      </header>

      {message && (
        <div className="up-admin-toast">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="up-admin-editor"
      >
        <div className="up-editor-head">
          <div>
            <div className="up-admin-kicker">
              NEW PRODUCT
            </div>

            <h2>Thông tin sản phẩm</h2>
          </div>
        </div>

        <div className="up-editor-grid">
          <div className="up-editor-left">
            <label>
              Tên sản phẩm

              <input
                value={form.name}
                placeholder="Ví dụ: Essential Oversized Tee"
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                onBlur={() => {
                  if (!form.slug.trim()) {
                    updateField(
                      "slug",
                      slugify(form.name),
                    );
                  }
                }}
                required
              />
            </label>

            <label>
              Slug

              <input
                value={form.slug}
                placeholder="essential-oversized-tee"
                onChange={(event) =>
                  updateField(
                    "slug",
                    event.target.value,
                  )
                }
                required
              />

              <small>
                Slug dùng để định danh sản phẩm trong
                hệ thống.
              </small>
            </label>

            <div className="up-two-col">
              <label>
                Danh mục

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value,
                    )
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
                Giá bán (VND)

                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.price}
                  onChange={(event) =>
                    updateField(
                      "price",
                      event.target.value,
                    )
                  }
                  required
                />
              </label>
            </div>

            <label>
              Mô tả ngắn

              <textarea
                rows={4}
                placeholder="Mô tả ngắn giúp khách hàng hiểu nhanh về sản phẩm."
                value={form.short_description}
                onChange={(event) =>
                  updateField(
                    "short_description",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Mô tả chi tiết

              <textarea
                rows={8}
                placeholder="Thông tin chi tiết về chất liệu, kiểu dáng, đặc điểm sản phẩm..."
                value={form.long_description}
                onChange={(event) =>
                  updateField(
                    "long_description",
                    event.target.value,
                  )
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
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Xem trước sản phẩm"
                />
              ) : (
                <div>
                  <b>＋</b>

                  <span>
                    TẢI ẢNH SẢN PHẨM
                  </span>

                  <small>
                    JPG, PNG, WEBP hoặc GIF
                  </small>

                  <small>
                    Tối đa 10 MB
                  </small>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(event) =>
                  handleImageChange(
                    event.target.files?.[0],
                  )
                }
              />
            </div>

            <label>
              Trạng thái

              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as Product["status"],
                  )
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
                onChange={(event) =>
                  updateField(
                    "featured",
                    event.target.checked,
                  )
                }
              />

              Sản phẩm nổi bật
            </label>

            <div className="up-editor-actions">
              <Link
                to="/admin/products"
                className="up-secondary"
              >
                HỦY
              </Link>

              <button
                type="submit"
                className="up-admin-primary"
                disabled={saving}
              >
                {saving
                  ? "ĐANG TẠO…"
                  : "LƯU SẢN PHẨM"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
