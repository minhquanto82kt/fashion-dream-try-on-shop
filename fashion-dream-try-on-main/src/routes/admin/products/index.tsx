// Admin products route
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  deleteProduct,
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

const PRODUCTS_PER_PAGE = 8;

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setMessage("");

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

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PRODUCTS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedProducts = useMemo(() => {
    const start =
      (safeCurrentPage - 1) *
      PRODUCTS_PER_PAGE;

    return filtered.slice(
      start,
      start + PRODUCTS_PER_PAGE,
    );
  }, [filtered, safeCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleSearchChange(
    value: string,
  ) {
    setQuery(value);
    setCurrentPage(1);
  }

  function handleStatusChange(
    value: string,
  ) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function handleCategoryChange(
    value: string,
  ) {
    setCategoryFilter(value);
    setCurrentPage(1);
  }

  async function handleDelete(
    product: Product,
  ) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?\n\nThao tác này có thể ảnh hưởng đến dữ liệu liên quan đến sản phẩm.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setMessage("");

    try {
      await deleteProduct(product.id);

      const updatedProducts =
        await listProducts();

      setProducts(updatedProducts);

      setMessage(
        `Đã xóa sản phẩm "${product.name}".`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể xóa sản phẩm.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="up-products-admin">
      {/* HEADER */}
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">
            CATALOG / CMS
          </div>

          <h1 className="up-products-page-title">
            Products
          </h1>

          <p className="up-products-page-description">
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

      {/* FILTER */}
      <section className="up-admin-toolbar">
        <input
          className="up-products-filter-input"
          placeholder="⌕  Tìm kiếm sản phẩm…"
          value={query}
          onChange={(e) =>
            handleSearchChange(e.target.value)
          }
        />

        <select
          className="up-products-filter-select"
          value={statusFilter}
          onChange={(e) =>
            handleStatusChange(e.target.value)
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
          className="up-products-filter-select"
          value={categoryFilter}
          onChange={(e) =>
            handleCategoryChange(e.target.value)
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

      {/* STATS */}
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

      {/* PRODUCT TABLE */}
      <section className="up-admin-table-wrap">
        <table className="up-admin-table up-products-table">
          <thead>
            <tr>
              <th>SẢN PHẨM</th>
              <th>DANH MỤC</th>
              <th>GIÁ</th>
              <th>TRẠNG THÁI</th>
              <th>NỔI BẬT</th>
              <th className="up-products-actions-heading">
                THAO TÁC
              </th>
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
            ) : paginatedProducts.length ? (
              paginatedProducts.map(
                (product) => (
                  <tr key={product.id}>
                    {/* PRODUCT */}
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

                    {/* CATEGORY */}
                    <td>
                      {product.category}
                    </td>

                    {/* PRICE */}
                    <td>
                      <strong>
                        {money(product.price)}
                      </strong>
                    </td>

                    {/* STATUS */}
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

                    {/* FEATURED */}
                    <td>
                      {product.featured
                        ? "●"
                        : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="up-product-actions">
                        {/* DETAIL */}
                        <Link
                          className="up-row-action"
                          to="/admin/products/$id"
                          params={{
                            id: product.id,
                          }}
                        >
                          CHI TIẾT
                        </Link>

                        {/* EDIT */}
                        <Link
                          className="up-row-action"
                          to="/admin/products/$id"
                          params={{
                            id: product.id,
                          }}
                        >
                          CHỈNH SỬA
                        </Link>

                        {/* DELETE */}
                        <button
                          type="button"
                          className="up-row-action up-row-action-danger"
                          disabled={
                            deletingId ===
                            product.id
                          }
                          onClick={() =>
                            void handleDelete(
                              product,
                            )
                          }
                        >
                          {deletingId ===
                          product.id
                            ? "ĐANG XÓA…"
                            : "XÓA"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )
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

      {/* PAGINATION */}
      {!loading && filtered.length > 0 && (
        <nav
          className="up-products-pagination"
          aria-label="Phân trang sản phẩm"
        >
          <button
            type="button"
            className="up-products-pagination-button"
            disabled={safeCurrentPage <= 1}
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.max(1, page - 1),
              )
            }
          >
            ← TRANG TRƯỚC
          </button>

          <div className="up-products-pagination-current">
            <strong>
              {safeCurrentPage}
            </strong>

            <span>/</span>

            <strong>
              {totalPages}
            </strong>
          </div>

          <button
            type="button"
            className="up-products-pagination-button"
            disabled={
              safeCurrentPage >=
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.min(
                    totalPages,
                    page + 1,
                  ),
              )
            }
          >
            TRANG SAU →
          </button>
        </nav>
      )}

      {/* MESSAGE */}
      {message && (
        <div className="up-admin-toast">
          {message}
        </div>
      )}
    </div>
  );
}
