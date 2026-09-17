import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  addProductImage,
  createProductVariant,
  deleteProductImage,
  deleteProductVariant,
  getProduct,
  listProductImages,
  listProductVariants,
  setPrimaryProductImage,
  updateProduct,
  updateProductImage,
  updateProductVariant,
  uploadProductImage,
  type Product,
  type ProductImage,
  type ProductVariant,
} from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/$id/")({ component: ProductEditorPage });

function ProductEditorPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [variantDraft, setVariantDraft] = useState({ size: "", color: "", sku: "", stock: 0 });

  async function load() {
    setLoading(true); setError("");
    try {
      const [data, variantData, imageData] = await Promise.all([getProduct(id), listProductVariants(id), listProductImages(id)]);
      if (!data) throw new Error("Không tìm thấy sản phẩm.");
      setProduct(data); setDraft(data); setVariants(variantData); setImages(imageData);
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể tải sản phẩm."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [id]);

  async function save() {
    if (!draft.name?.trim() || !draft.slug?.trim() || !draft.category?.trim() || !Number.isFinite(Number(draft.price)) || Number(draft.price) < 0) {
      setError("Tên, slug, danh mục và giá phải hợp lệ."); return;
    }
    setSaving(true); setError(""); setMessage("");
    try {
      const saved = await updateProduct(id, { name: draft.name.trim(), slug: draft.slug.trim(), category: draft.category.trim(), price: Number(draft.price), description: draft.description ?? null, short_description: draft.short_description ?? null, long_description: draft.long_description ?? null, active: draft.active ?? true, status: draft.status ?? "draft", featured: draft.featured ?? false });
      if (!saved) throw new Error("Không cập nhật được sản phẩm.");
      setProduct(saved); setDraft(saved); setMessage("Đã lưu thông tin sản phẩm.");
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể cập nhật sản phẩm."); }
    finally { setSaving(false); }
  }

  async function addVariant() {
    if (!variantDraft.size.trim() || !variantDraft.color.trim() || !Number.isInteger(variantDraft.stock) || variantDraft.stock < 0) { setError("Size, màu và tồn kho phải hợp lệ."); return; }
    setBusy(true); setError(""); setMessage("");
    try { const created = await createProductVariant({ product_id: id, size: variantDraft.size, color: variantDraft.color, sku: variantDraft.sku || null, stock: variantDraft.stock }); if (!created) throw new Error("Không tạo được biến thể."); setVariants((current) => [...current, created]); setVariantDraft({ size: "", color: "", sku: "", stock: 0 }); setMessage("Đã thêm biến thể."); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể thêm biến thể."); }
    finally { setBusy(false); }
  }

  async function editVariant(variant: ProductVariant) {
    const size = window.prompt("Size", variant.size); if (size === null) return;
    const color = window.prompt("Màu", variant.color); if (color === null) return;
    const sku = window.prompt("SKU (để trống nếu không dùng)", variant.sku ?? ""); if (sku === null) return;
    const stockText = window.prompt("Tồn kho", String(variant.stock)); if (stockText === null) return;
    const stock = Number(stockText);
    if (!size.trim() || !color.trim() || !Number.isInteger(stock) || stock < 0) { setError("Dữ liệu biến thể không hợp lệ."); return; }
    setBusy(true); setError(""); setMessage("");
    try { const saved = await updateProductVariant(variant.id, { size, color, sku, stock }); if (!saved) throw new Error("Không cập nhật được biến thể."); setVariants((current) => current.map((item) => item.id === variant.id ? saved : item)); setMessage("Đã cập nhật biến thể."); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể cập nhật biến thể."); }
    finally { setBusy(false); }
  }

  async function removeVariant(variant: ProductVariant) {
    if (!window.confirm(`Xóa biến thể ${variant.size} / ${variant.color}? Nếu biến thể đã xuất hiện trong đơn hàng, dữ liệu lịch sử order item vẫn được giữ và variant_id có thể được SET NULL.`)) return;
    setBusy(true); setError("");
    try { await deleteProductVariant(variant.id); setVariants((current) => current.filter((item) => item.id !== variant.id)); setMessage("Đã xóa biến thể."); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể xóa biến thể."); }
    finally { setBusy(false); }
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const selected = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (!selected.length) throw new Error("Chỉ chấp nhận file hình ảnh.");
      let nextOrder = images.length;
      for (const file of selected) {
        const url = await uploadProductImage(id, file);
        const created = await addProductImage(id, url, images.length === 0 && nextOrder === 0, nextOrder++);
        if (created) setImages((current) => [...current, created]);
      }
      setMessage(`Đã tải lên ${selected.length} hình ảnh.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể tải hình ảnh."); }
    finally { setBusy(false); }
  }

  async function makePrimary(image: ProductImage) {
    if (!image.id) return;
    setBusy(true); setError("");
    try { await setPrimaryProductImage(id, image.id); setImages((current) => current.map((item) => ({ ...item, is_primary: item.id === image.id }))); setMessage("Đã đặt ảnh chính."); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể đặt ảnh chính."); }
    finally { setBusy(false); }
  }

  async function editImage(image: ProductImage) {
    if (!image.id) return;
    const alt = window.prompt("Alt text", image.alt_text ?? ""); if (alt === null) return;
    const orderText = window.prompt("Thứ tự hiển thị", String(image.sort_order)); if (orderText === null) return;
    const sortOrder = Number(orderText);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setError("Thứ tự ảnh không hợp lệ."); return; }
    setBusy(true); setError("");
    try { const saved = await updateProductImage(image.id, { alt_text: alt.trim() || null, sort_order: sortOrder }); if (!saved) throw new Error("Không cập nhật được ảnh."); setImages((current) => current.map((item) => item.id === image.id ? saved : item).sort((a, b) => a.sort_order - b.sort_order)); setMessage("Đã cập nhật ảnh."); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể cập nhật ảnh."); }
    finally { setBusy(false); }
  }

  async function removeImage(image: ProductImage) {
    if (!image.id || !window.confirm("Xóa ảnh này khỏi sản phẩm? File trong Storage sẽ không tự xóa.")) return;
    setBusy(true); setError("");
    try { await deleteProductImage(image.id); setImages((current) => current.filter((item) => item.id !== image.id)); setMessage("Đã xóa ảnh khỏi catalog."); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể xóa ảnh."); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="up-admin-empty">Đang tải sản phẩm…</div>;
  if (!product) return <div className="up-admin-empty">{error || "Không tìm thấy sản phẩm."}</div>;

  return <div className="up-products-admin">
    <header className="up-admin-topbar"><div><div className="up-admin-kicker">CATALOG / PRODUCT</div><h1 className="up-products-page-title">{product.name}</h1><p className="up-products-page-description">/{product.slug}</p></div><div style={{ display: "flex", gap: 8 }}><Link className="up-admin-secondary" to="/admin/products">QUAY LẠI</Link><button className="up-admin-primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "ĐANG LƯU…" : "LƯU THAY ĐỔI"}</button></div></header>
    {error && <div className="up-admin-toast">{error}</div>}{message && <div className="up-admin-toast">{message}</div>}
    <section className="up-admin-table-wrap" style={{ padding: 24 }}><h2>Thông tin sản phẩm</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
      <label>Tên<input value={draft.name ?? ""} onChange={(e) => setDraft(v => ({ ...v, name: e.target.value }))} /></label><label>Slug<input value={draft.slug ?? ""} onChange={(e) => setDraft(v => ({ ...v, slug: e.target.value }))} /></label><label>Danh mục<input value={draft.category ?? ""} onChange={(e) => setDraft(v => ({ ...v, category: e.target.value }))} /></label><label>Giá<input type="number" min="0" value={draft.price ?? 0} onChange={(e) => setDraft(v => ({ ...v, price: Number(e.target.value) }))} /></label><label>Mô tả ngắn<textarea value={draft.short_description ?? ""} onChange={(e) => setDraft(v => ({ ...v, short_description: e.target.value }))} /></label><label>Mô tả<textarea value={draft.description ?? ""} onChange={(e) => setDraft(v => ({ ...v, description: e.target.value }))} /></label><label>Mô tả dài<textarea value={draft.long_description ?? ""} onChange={(e) => setDraft(v => ({ ...v, long_description: e.target.value }))} /></label><div><label><input type="checkbox" checked={Boolean(draft.active)} onChange={(e) => setDraft(v => ({ ...v, active: e.target.checked }))} /> Active</label><label><input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => setDraft(v => ({ ...v, featured: e.target.checked }))} /> Featured</label><label>Trạng thái<select value={draft.status ?? "draft"} onChange={(e) => setDraft(v => ({ ...v, status: e.target.value as Product["status"] }))}><option value="draft">Bản nháp</option><option value="published">Đang hoạt động</option><option value="archived">Đã ẩn</option></select></label></div>
    </div></section>

    <section className="up-admin-table-wrap" style={{ marginTop: 24, padding: 24 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}><div><h2>Biến thể & tồn kho</h2><p style={{ margin: 0 }}>Mỗi size/màu là một SKU; tồn kho được trừ nguyên tử khi tạo đơn.</p></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, marginTop: 16 }}><input placeholder="Size" value={variantDraft.size} onChange={(e) => setVariantDraft(v => ({ ...v, size: e.target.value }))} /><input placeholder="Màu" value={variantDraft.color} onChange={(e) => setVariantDraft(v => ({ ...v, color: e.target.value }))} /><input placeholder="SKU" value={variantDraft.sku} onChange={(e) => setVariantDraft(v => ({ ...v, sku: e.target.value }))} /><input type="number" min="0" placeholder="Tồn kho" value={variantDraft.stock} onChange={(e) => setVariantDraft(v => ({ ...v, stock: Number(e.target.value) }))} /><button className="up-admin-primary" type="button" disabled={busy} onClick={() => void addVariant()}>＋ THÊM</button></div><table className="up-admin-table" style={{ marginTop: 16 }}><thead><tr><th>SIZE</th><th>MÀU</th><th>SKU</th><th>TỒN</th><th>THAO TÁC</th></tr></thead><tbody>{variants.length ? variants.map((variant) => <tr key={variant.id}><td>{variant.size}</td><td>{variant.color}</td><td>{variant.sku || "—"}</td><td><strong>{variant.stock}</strong></td><td><button type="button" className="up-row-action" disabled={busy} onClick={() => void editVariant(variant)}>SỬA</button><button type="button" className="up-row-action" disabled={busy} onClick={() => void removeVariant(variant)}>XÓA</button></td></tr>) : <tr><td colSpan={5} className="up-admin-empty">Chưa có biến thể.</td></tr>}</tbody></table></section>

    <section className="up-admin-table-wrap" style={{ marginTop: 24, padding: 24 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}><div><h2>Hình ảnh sản phẩm</h2><p style={{ margin: 0 }}>Ảnh được lưu trong bucket product-images và metadata trong product_images.</p></div><label className="up-admin-primary" style={{ cursor: busy ? "wait" : "pointer" }}>＋ TẢI ẢNH<input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => void uploadImages(e.target.files)} /></label></div><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginTop: 18 }}>{images.length ? images.map((image) => <article key={image.id ?? image.image_url} style={{ border: image.is_primary ? "2px solid var(--color-primary, #f0a500)" : "1px solid #ddd", padding: 8 }}><img src={image.image_url} alt={image.alt_text ?? ""} style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover" }} /><div style={{ fontSize: 11, marginTop: 8 }}>#{image.sort_order} {image.is_primary ? "· ẢNH CHÍNH" : ""}</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}><button type="button" className="up-row-action" disabled={busy || image.is_primary} onClick={() => void makePrimary(image)}>ĐẶT CHÍNH</button><button type="button" className="up-row-action" disabled={busy} onClick={() => void editImage(image)}>SỬA</button><button type="button" className="up-row-action" disabled={busy} onClick={() => void removeImage(image)}>XÓA</button></div></article>) : <div className="up-admin-empty" style={{ gridColumn: "1 / -1" }}>Chưa có hình ảnh.</div>}</div></section>
  </div>;
}
