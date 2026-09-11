import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  listProductVariants,
  listProducts,
  type Product,
  type ProductVariant,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/inventory/")({
  component: InventoryAdminPage,
  head: () => ({
    meta: [{ title: "Inventory Admin — UpThink" }],
  }),
});

const LOW_STOCK_THRESHOLD = 5;

type InventoryRow = ProductVariant & {
  product: Product;
};

function InventoryAdminPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      setLoading(true);
      setMessage("");

      try {
        const products = await listProducts();
        const variantsByProduct = await Promise.all(
          products.map(async (product) => {
            const variants = await listProductVariants(product.id);
            return variants.map((variant) => ({ ...variant, product }));
          }),
        );

        if (!cancelled) {
          setRows(variantsByProduct.flat());
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Không thể tải dữ liệu tồn kho.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInventory();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const text = [
        row.product.name,
        row.product.slug,
        row.sku ?? "",
        row.size,
        row.color,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "out" && row.stock === 0) ||
        (statusFilter === "low" && row.stock > 0 && row.stock <= LOW_STOCK_THRESHOLD) ||
        (statusFilter === "healthy" && row.stock > LOW_STOCK_THRESHOLD);

      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const totalUnits = rows.reduce((sum, row) => sum + row.stock, 0);
  const lowStockCount = rows.filter(
    (row) => row.stock > 0 && row.stock <= LOW_STOCK_THRESHOLD,
  ).length;
  const outOfStockCount = rows.filter((row) => row.stock === 0).length;

  return (
    <div className="up-inventory-admin">
      <style>{`
        .up-inventory-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .up-inventory-summary-card {
          background: #fff;
          border: 1px solid #e3e2dc;
          padding: 16px 18px;
        }

        .up-inventory-summary-card span {
          display: block;
          color: #898a86;
          font-size: 9px;
          letter-spacing: .13em;
        }

        .up-inventory-summary-card strong {
          display: block;
          margin-top: 8px;
          font-size: 23px;
        }

        .up-inventory-toolbar-note {
          margin: -6px 0 18px;
          color: #8a8b86;
          font-size: 11px;
        }

        .up-inventory-status {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .04em;
        }

        .up-inventory-status.healthy {
          background: #def4e8;
          color: #167243;
        }

        .up-inventory-status.low {
          background: #fff1c9;
          color: #916b00;
        }

        .up-inventory-status.out {
          background: #ffe3df;
          color: #a32727;
        }

        .up-inventory-stock {
          font-size: 16px;
          font-weight: 800;
        }

        .up-inventory-stock.low { color: #916b00; }
        .up-inventory-stock.out { color: #a32727; }

        .up-inventory-product-link {
          color: inherit;
          text-decoration: none;
        }

        .up-inventory-product-link:hover {
          text-decoration: underline;
        }

        .up-inventory-muted {
          color: #999;
        }

        @media (max-width: 900px) {
          .up-inventory-summary { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">STOCK / OPERATIONS</div>
          <h1>Inventory</h1>
          <p>Theo dõi tồn kho theo từng biến thể sản phẩm</p>
        </div>
      </header>

      <section className="up-inventory-summary" aria-label="Tổng quan tồn kho">
        <div className="up-inventory-summary-card">
          <span>TỔNG BIẾN THỂ</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="up-inventory-summary-card">
          <span>TỔNG SỐ LƯỢNG</span>
          <strong>{totalUnits}</strong>
        </div>
        <div className="up-inventory-summary-card">
          <span>SẮP HẾT</span>
          <strong>{lowStockCount}</strong>
        </div>
        <div className="up-inventory-summary-card">
          <span>HẾT HÀNG</span>
          <strong>{outOfStockCount}</strong>
        </div>
      </section>

      <section className="up-admin-toolbar">
        <input
          placeholder="⌕  Tìm sản phẩm, SKU, size hoặc màu…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">Tất cả tồn kho</option>
          <option value="healthy">Đủ hàng</option>
          <option value="low">Sắp hết ≤ {LOW_STOCK_THRESHOLD}</option>
          <option value="out">Hết hàng</option>
        </select>
      </section>

      <p className="up-inventory-toolbar-note">
        Nguồn dữ liệu: <strong>product_variants.stock</strong>. Chỉnh sửa chi tiết tại Product.
      </p>

      {message && <div className="up-admin-error">{message}</div>}

      <section className="up-admin-table-wrap">
        <table className="up-admin-table">
          <thead>
            <tr>
              <th>SẢN PHẨM</th>
              <th>SIZE</th>
              <th>MÀU</th>
              <th>SKU</th>
              <th>TỒN KHO</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="up-admin-empty">Đang tải tồn kho…</td>
              </tr>
            ) : filteredRows.length ? (
              filteredRows.map((row) => {
                const status =
                  row.stock === 0
                    ? "out"
                    : row.stock <= LOW_STOCK_THRESHOLD
                      ? "low"
                      : "healthy";

                return (
                  <tr key={row.id}>
                    <td>
                      <Link
                        className="up-inventory-product-link"
                        to="/admin/products/$id"
                        params={{ id: row.product.id }}
                      >
                        <strong>{row.product.name}</strong>
                      </Link>
                      <small className="up-inventory-muted">/{row.product.slug}</small>
                    </td>
                    <td>{row.size}</td>
                    <td>{row.color}</td>
                    <td>{row.sku || "—"}</td>
                    <td>
                      <span className={`up-inventory-stock ${status}`}>
                        {row.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`up-inventory-status ${status}`}>
                        {status === "out"
                          ? "HẾT HÀNG"
                          : status === "low"
                            ? "SẮP HẾT"
                            : "ĐỦ HÀNG"}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="up-row-action"
                        to="/admin/products/$id"
                        params={{ id: row.product.id }}
                      >
                        CHỈNH SỬA
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="up-admin-empty">
                  Không có biến thể phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
