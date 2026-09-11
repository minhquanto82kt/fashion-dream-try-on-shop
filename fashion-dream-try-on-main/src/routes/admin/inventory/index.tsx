import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listProductVariants,
  listProducts,
  updateProductVariant,
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

type InventoryRow = ProductVariant & { product: Product };

function InventoryAdminPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const products = await listProducts();
      const variantsByProduct = await Promise.all(
        products.map(async (product) => {
          const variants = await listProductVariants(product.id);
          return variants.map((variant) => ({ ...variant, product }));
        }),
      );
      setRows(variantsByProduct.flat());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu tồn kho.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const text = [row.product.name, row.product.slug, row.sku ?? "", row.size, row.color]
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
  const lowStockCount = rows.filter((row) => row.stock > 0 && row.stock <= LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = rows.filter((row) => row.stock === 0).length;

  function startEditing(row: InventoryRow) {
    setEditingId(row.id);
    setEditingStock(String(row.stock));
    setMessage("");
    setError("");
  }

  function cancelEditing() {
    if (savingId) return;
    setEditingId(null);
    setEditingStock("");
  }

  async function saveStock(row: InventoryRow) {
    const stock = Number(editingStock);
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock phải là số nguyên từ 0 trở lên.");
      return;
    }

    setSavingId(row.id);
    setMessage("");
    setError("");
    try {
      const updated = await updateProductVariant(row.id, { stock });
      const nextStock = updated?.stock ?? stock;
      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, stock: nextStock } : item)));
      setEditingId(null);
      setEditingStock("");
      setMessage(`Đã cập nhật tồn kho ${row.product.name} — ${row.size} / ${row.color}: ${nextStock}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật tồn kho.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="up-inventory-admin">
      <style>{`
        .up-inventory-summary { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:18px; }
        .up-inventory-summary-card { background:#fff; border:1px solid #e3e2dc; padding:16px 18px; }
        .up-inventory-summary-card span { display:block; color:#898a86; font-size:9px; letter-spacing:.13em; }
        .up-inventory-summary-card strong { display:block; margin-top:8px; font-size:23px; }
        .up-inventory-toolbar-note { margin:-6px 0 18px; color:#8a8b86; font-size:11px; }
        .up-inventory-status { display:inline-flex; align-items:center; padding:5px 9px; font-size:9px; font-weight:800; letter-spacing:.04em; }
        .up-inventory-status.healthy { background:#def4e8; color:#167243; }
        .up-inventory-status.low { background:#fff1c9; color:#916b00; }
        .up-inventory-status.out { background:#ffe3df; color:#a32727; }
        .up-inventory-stock { font-size:16px; font-weight:800; }
        .up-inventory-stock.low { color:#916b00; }
        .up-inventory-stock.out { color:#a32727; }
        .up-inventory-product-link { color:inherit; text-decoration:none; }
        .up-inventory-product-link:hover { text-decoration:underline; }
        .up-inventory-muted { display:block; color:#999; }
        .up-inventory-edit { display:flex; align-items:center; gap:7px; }
        .up-inventory-edit input { width:86px; min-width:86px; padding:8px 9px; border:1px solid #1b1a17; background:#fff; font:inherit; font-weight:800; }
        .up-inventory-edit button { white-space:nowrap; }
        .up-inventory-save { border:0; background:#1b1a17; color:#fff; padding:8px 10px; font-size:9px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-inventory-save:disabled { opacity:.5; cursor:not-allowed; }
        .up-inventory-cancel { border:1px solid #d8d7d1; background:#fff; padding:7px 9px; font-size:9px; font-weight:800; cursor:pointer; }
        @media (max-width:900px) { .up-inventory-summary { grid-template-columns:1fr 1fr; } .up-inventory-edit { flex-wrap:wrap; } }
      `}</style>

      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">STOCK / OPERATIONS</div>
          <h1>Inventory</h1>
          <p>Theo dõi và cập nhật tồn kho theo từng biến thể sản phẩm</p>
        </div>
      </header>

      <section className="up-inventory-summary" aria-label="Tổng quan tồn kho">
        <div className="up-inventory-summary-card"><span>TỔNG BIẾN THỂ</span><strong>{rows.length}</strong></div>
        <div className="up-inventory-summary-card"><span>TỔNG SỐ LƯỢNG</span><strong>{totalUnits}</strong></div>
        <div className="up-inventory-summary-card"><span>SẮP HẾT</span><strong>{lowStockCount}</strong></div>
        <div className="up-inventory-summary-card"><span>HẾT HÀNG</span><strong>{outOfStockCount}</strong></div>
      </section>

      <section className="up-admin-toolbar">
        <input placeholder="⌕  Tìm sản phẩm, SKU, size hoặc màu…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Tất cả tồn kho</option>
          <option value="healthy">Đủ hàng</option>
          <option value="low">Sắp hết ≤ {LOW_STOCK_THRESHOLD}</option>
          <option value="out">Hết hàng</option>
        </select>
      </section>

      <p className="up-inventory-toolbar-note">
        Nguồn dữ liệu: <strong>product_variants.stock</strong>. Có thể chỉnh stock trực tiếp tại đây hoặc trong Product Detail.
      </p>

      {error && <div className="up-admin-error" role="alert">{error}</div>}
      {message && <div className="up-admin-toast" role="status">{message}</div>}

      <section className="up-admin-table-wrap">
        <table className="up-admin-table">
          <thead><tr><th>SẢN PHẨM</th><th>SIZE</th><th>MÀU</th><th>SKU</th><th>TỒN KHO</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="up-admin-empty">Đang tải tồn kho…</td></tr>
            ) : filteredRows.length ? (
              filteredRows.map((row) => {
                const status = row.stock === 0 ? "out" : row.stock <= LOW_STOCK_THRESHOLD ? "low" : "healthy";
                const editing = editingId === row.id;
                const saving = savingId === row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <Link className="up-inventory-product-link" to="/admin/products/$id" params={{ id: row.product.id }}>
                        <strong>{row.product.name}</strong>
                      </Link>
                      <small className="up-inventory-muted">/{row.product.slug}</small>
                    </td>
                    <td>{row.size}</td>
                    <td>{row.color}</td>
                    <td>{row.sku || "—"}</td>
                    <td>
                      {editing ? (
                        <div className="up-inventory-edit">
                          <input type="number" min="0" step="1" value={editingStock} onChange={(event) => setEditingStock(event.target.value)} disabled={saving} autoFocus />
                          <button className="up-inventory-save" type="button" onClick={() => void saveStock(row)} disabled={saving}>{saving ? "LƯU…" : "LƯU"}</button>
                          <button className="up-inventory-cancel" type="button" onClick={cancelEditing} disabled={saving}>HỦY</button>
                        </div>
                      ) : (
                        <span className={`up-inventory-stock ${status}`}>{row.stock}</span>
                      )}
                    </td>
                    <td><span className={`up-inventory-status ${status}`}>{status === "out" ? "HẾT HÀNG" : status === "low" ? "SẮP HẾT" : "ĐỦ HÀNG"}</span></td>
                    <td>
                      {!editing && <button className="up-row-action" type="button" onClick={() => startEditing(row)} disabled={Boolean(savingId)}>CHỈNH STOCK</button>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={7} className="up-admin-empty">Không có biến thể phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
