import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listAdminTags, type AdminTag } from "@/lib/admin-tags";
import { getProductTags, setProductTags } from "@/lib/admin-product-tags";
import { getProduct, type Product } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/products/$id/tags")({
  component: ProductTagsPage,
  head: () => ({ meta: [{ title: "Product Tags — Admin — WEARO" }] }),
});

function ProductTagsPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const [productData, allTags, productTags] = await Promise.all([
          getProduct(id), listAdminTags("active"), getProductTags(id),
        ]);
        if (!cancelled) {
          setProduct(productData);
          setTags(allTags);
          setSelectedIds(productTags.map((tag) => tag.id));
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tags.filter((tag) => !q || `${tag.name} ${tag.slug} ${tag.description ?? ""}`.toLowerCase().includes(q));
  }, [tags, search]);

  const selected = tags.filter((tag) => selectedIds.includes(tag.id));

  function toggle(tagId: string) {
    setSelectedIds((current) => current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]);
    setMessage("");
  }

  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      const saved = await setProductTags(id, selectedIds);
      setSelectedIds(saved.map((tag) => tag.id));
      setMessage(`Đã lưu ${saved.length} tag cho sản phẩm.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu tags."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="up-admin-empty">Đang tải product tags…</div>;
  if (!product) return <div className="up-admin-empty">{error || "Không tìm thấy sản phẩm."}</div>;

  return <div className="up-product-tags-page">
    <header className="up-admin-topbar">
      <div><div className="up-admin-kicker">CATALOG / PRODUCT / TAGS</div><h1>{product.name}</h1><p>Quản lý quan hệ Product ↔ Tags bằng Admin API.</p></div>
      <div style={{display:"flex",gap:8}}><Link className="up-admin-secondary" to="/admin/products/$id" params={{id}}>← CHI TIẾT</Link><button className="up-admin-primary" type="button" onClick={() => void save()} disabled={saving}>{saving ? "ĐANG LƯU…" : "LƯU TAGS"}</button></div>
    </header>

    <section className="up-admin-editor up-product-tags-workspace">
      <div className="up-editor-head"><div><div className="up-admin-kicker">L · LIST / R · READ</div><h2>Product Tags</h2><p>Chọn các tag Active đang áp dụng cho sản phẩm này. Archive/Delete tag được quản lý ở module Tags.</p></div><span className="up-product-tags-count">{selected.length} TAGS</span></div>
      <div className="up-product-tags-selected">{selected.length ? selected.map((tag) => <button key={tag.id} type="button" className="up-product-tag-chip" onClick={() => toggle(tag.id)}>{tag.name}<X size={11}/></button>) : <span>Chưa có tag nào được gán.</span>}</div>
      <div className="up-product-tags-toolbar"><div className="up-product-tags-search"><Search size={13}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Tìm tag…"/></div><Link className="up-product-tags-manage" to="/admin/tags">QUẢN LÝ TAGS ↗</Link></div>
      <div className="up-product-tags-options">{filtered.length ? filtered.map((tag) => { const checked=selectedIds.includes(tag.id); return <button type="button" key={tag.id} className={`up-product-tag-option ${checked?"selected":""}`} onClick={()=>toggle(tag.id)}><span className="up-product-tag-check">{checked?<Check size={11}/>:null}</span><span><strong>{tag.name}</strong><small>/{tag.slug}</small></span></button>; }) : <div className="up-admin-empty">Không tìm thấy tag.</div>}</div>
      <div className="up-product-tags-footer"><span>U · UPDATE: thay đổi danh sách liên kết chỉ ghi vào Supabase sau khi lưu.</span><button className="up-secondary" type="button" onClick={() => setSelectedIds(selected.map((tag)=>tag.id))} disabled={saving}>KHÔI PHỤC</button></div>
      {error && <div className="up-tag-feedback error">{error}</div>}{message && <div className="up-tag-feedback success">{message}</div>}
    </section>

    <style>{`.up-product-tags-page{display:grid;gap:18px}.up-product-tags-workspace{padding:0;overflow:hidden}.up-product-tags-head{padding:20px 22px;border-bottom:1px solid #e3e2dc;display:flex;justify-content:space-between;gap:18px}.up-product-tags-selected{display:flex;flex-wrap:wrap;gap:7px;min-height:58px;padding:12px 22px;border-bottom:1px solid #eeeDE8}.up-product-tags-selected>span{align-self:center;color:#999;font-size:11px}.up-product-tag-chip{display:inline-flex;align-items:center;gap:7px;border:1px solid #efc15a;background:#fff9e9;padding:6px 8px;font-size:10px;color:#654c12;cursor:pointer}.up-product-tags-count{font-size:9px;letter-spacing:.12em;color:#607080;background:#edf2f5;border:1px solid #d7e0e6;padding:5px 7px;height:max-content}.up-product-tags-toolbar{display:flex;gap:10px;padding:12px 22px;border-bottom:1px solid #eeeDE8}.up-product-tags-search{flex:1;display:flex;align-items:center;gap:8px;border:1px solid #dddcd5;padding:0 10px}.up-product-tags-search svg{color:#999}.up-product-tags-search input{border:0;outline:0;width:100%;padding:10px 0;font-size:11px}.up-product-tags-manage{display:flex;align-items:center;border:1px solid #dddcd5;padding:0 12px;font-size:9px;letter-spacing:.08em;color:#555;text-decoration:none}.up-product-tags-options{display:grid;grid-template-columns:repeat(3,1fr);max-height:360px;overflow:auto}.up-product-tag-option{display:flex;align-items:center;gap:9px;border:0;border-right:1px solid #eeeDE8;border-bottom:1px solid #eeeDE8;background:#fff;text-align:left;padding:14px;cursor:pointer}.up-product-tag-option:hover,.up-product-tag-option.selected{background:#fafaf7}.up-product-tag-check{width:18px;height:18px;display:grid;place-items:center;border:1px solid #d3d2cc;color:#fff;background:#fff;flex:none}.up-product-tag-option.selected .up-product-tag-check{background:#f2a900;border-color:#f2a900}.up-product-tag-option strong{display:block;font-size:10px}.up-product-tag-option small{display:block;margin-top:3px;color:#999;font:9px ui-monospace,monospace}.up-product-tags-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 22px;background:#fafaf7;color:#888;font-size:9px}.up-tag-feedback{padding:0 22px 14px;font-size:10px}.up-tag-feedback.error{color:#c44b1d}.up-tag-feedback.success{color:#2c5745}@media(max-width:760px){.up-product-tags-options{grid-template-columns:1fr 1fr}.up-product-tags-toolbar{flex-direction:column}.up-product-tags-manage{min-height:36px;justify-content:center}.up-product-tags-footer{align-items:flex-start;flex-direction:column}}@media(max-width:480px){.up-product-tags-options{grid-template-columns:1fr}}`}</style>
  </div>;
}
