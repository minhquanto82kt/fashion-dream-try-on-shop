// Admin products route
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listProducts, updateProduct, type Product } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/")({
  component: ProductAdminPage,
  head: () => ({ meta: [{ title: "Products Admin — UpThink" }] }),
});

const categories = ["hoodies", "tees", "outerwear", "pants", "cap", "sunglass", "accessories"];
const PRODUCTS_PER_PAGE = 8;
function money(value: number) { return new Intl.NumberFormat("vi-VN").format(value) + " ₫"; }

function ProductAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState(""); const [statusFilter, setStatusFilter] = useState("all"); const [categoryFilter, setCategoryFilter] = useState("all");
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true); const [archivingId, setArchivingId] = useState<string | null>(null); const [currentPage, setCurrentPage] = useState(1);

  async function loadProducts() { setLoading(true); setMessage(""); try { setProducts(await listProducts()); } catch (error) { setMessage(error instanceof Error ? error.message : "Không thể tải danh sách sản phẩm."); } finally { setLoading(false); } }
  useEffect(() => { let cancelled = false; void listProducts().then((data) => { if (!cancelled) setProducts(data); }).catch((error) => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Không thể tải danh sách sản phẩm."); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, []);

  const filtered = useMemo(() => products.filter((product) => { const text = `${product.name} ${product.slug}`.toLowerCase(); return (!query || text.includes(query.toLowerCase())) && (statusFilter === "all" || product.status === statusFilter) && (categoryFilter === "all" || product.category === categoryFilter); }), [products, query, statusFilter, categoryFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE)); const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => filtered.slice((safeCurrentPage - 1) * PRODUCTS_PER_PAGE, safeCurrentPage * PRODUCTS_PER_PAGE), [filtered, safeCurrentPage]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  async function handleArchive(product: Product) {
    if (product.status === "archived") { if (!window.confirm(`Khôi phục sản phẩm "${product.name}" về bản nháp?`)) return; }
    else if (!window.confirm(`Ẩn sản phẩm "${product.name}"?\n\nSản phẩm sẽ được archive/deactivate thay vì xóa dữ liệu liên quan đến đơn hàng.`)) return;
    setArchivingId(product.id); setMessage("");
    try { await updateProduct(product.id, { status: product.status === "archived" ? "draft" : "archived", active: false }); setProducts(await listProducts()); setMessage(product.status === "archived" ? `Đã đưa "${product.name}" về bản nháp.` : `Đã ẩn "${product.name}". Không xóa dữ liệu commerce.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Không thể cập nhật trạng thái sản phẩm."); }
    finally { setArchivingId(null); }
  }

  return <div className="up-products-admin">
    <header className="up-admin-topbar"><div><div className="up-admin-kicker">CATALOG / CMS</div><h1 className="up-products-page-title">Products</h1><p className="up-products-page-description">Quản lý sản phẩm của cửa hàng</p></div><Link className="up-admin-primary" to="/admin/products/new">＋ THÊM SẢN PHẨM</Link></header>
    <section className="up-admin-toolbar"><input className="up-products-filter-input" placeholder="⌕  Tìm kiếm sản phẩm…" value={query} onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }} /><select className="up-products-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}><option value="all">Tất cả trạng thái</option><option value="published">Đang hoạt động</option><option value="draft">Bản nháp</option><option value="archived">Đã ẩn</option></select><select className="up-products-filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}><option value="all">Tất cả danh mục</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></section>
    <section className="up-admin-stats"><div><span>TỔNG SẢN PHẨM</span><strong>{products.length}</strong></div><div><span>ĐANG BÁN</span><strong>{products.filter((p) => p.status === "published").length}</strong></div><div><span>BẢN NHÁP</span><strong>{products.filter((p) => p.status === "draft").length}</strong></div><div><span>NỔI BẬT</span><strong>{products.filter((p) => p.featured).length}</strong></div></section>
    <section className="up-admin-table-wrap"><table className="up-admin-table up-products-table"><thead><tr><th>SẢN PHẨM</th><th>DANH MỤC</th><th>GIÁ</th><th>TRẠNG THÁI</th><th>NỔI BẬT</th><th className="up-products-actions-heading">THAO TÁC</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="up-admin-empty">Đang tải sản phẩm…</td></tr> : paginatedProducts.map((product) => <tr key={product.id}><td><div className="up-product-cell">{product.image ? <img src={product.image} alt="" /> : <div className="up-product-placeholder">U</div>}<div><strong>{product.name}</strong><small>/{product.slug}</small></div></div></td><td>{product.category}</td><td><strong>{money(product.price)}</strong></td><td><span className={`up-status ${product.status}`}>{product.status === "published" ? "Đang hoạt động" : product.status === "draft" ? "Bản nháp" : "Đã ẩn"}</span></td><td>{product.featured ? "●" : "—"}</td><td><details className="up-product-actions-menu"><summary className="up-product-actions-trigger" aria-label={`Mở thao tác cho ${product.name}`} title="Thao tác"><span aria-hidden="true">⋯</span></summary><div className="up-product-actions-popover"><Link className="up-row-action" to="/admin/products/$id" params={{ id: product.id }}>CHI TIẾT / SỬA</Link><Link className="up-row-action" to="/admin/products/$id/tags" params={{ id: product.id }}>TAGS</Link><button type="button" className="up-row-action" disabled={archivingId === product.id} onClick={() => void handleArchive(product)}>{archivingId === product.id ? "ĐANG CẬP NHẬT…" : product.status === "archived" ? "KHÔI PHỤC" : "ẨN SẢN PHẨM"}</button></div></details></td></tr>)}</tbody></table>{!loading && !filtered.length && <div className="up-admin-empty">Không có sản phẩm phù hợp.</div>}</section>
    {!loading && filtered.length > 0 && <nav className="up-products-pagination" aria-label="Phân trang sản phẩm"><button type="button" className="up-products-pagination-button" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>← TRANG TRƯỚC</button><div className="up-products-pagination-current"><strong>{safeCurrentPage}</strong><span>/</span><strong>{totalPages}</strong></div><button type="button" className="up-products-pagination-button" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>TRANG SAU →</button></nav>}
    {message && <div className="up-admin-toast">{message}</div>}
  </div>;
}
