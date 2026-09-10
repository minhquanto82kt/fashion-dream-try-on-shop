// Admin products route
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  listProducts,
  type Product,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/")({
  component: ProductAdminPage,
  head: () => ({
    meta: [{ title: "Products Admin — UpThink" }],
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

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function ProductAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">
            CATALOG / CMS
          </div>

          <h1>Products</h1>

          <p>
            Quản lý sản phẩm của cửa hàng
          </p>
        </div>

        <Link
          className="up-admin-primary"
          to="/admin/products/new"
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
          <strong>{products.length}</strong>
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
              <th></th>
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
                          alt=""
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

                  <td>
                    {product.category}
                  </td>

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
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent:
                          "flex-end",
                      }}
                    >
                      <Link
                        className="up-row-action"
                        to="/admin/products/$id"
                        params={{
                          id: product.id,
                        }}
                      >
                        CHI TIẾT
                      </Link>
                    </div>
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
    </div>
  );
}
