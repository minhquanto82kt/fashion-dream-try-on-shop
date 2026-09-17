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
      setLoading(true);
      setError("");
      try {
        const [productData, allTags, productTags] = await Promise.all([
          getProduct(id),
          listAdminTags("active"),
          getProductTags(id),
        ]);
        if (!cancelled) {
          setProduct(productData);
          setTags(allTags);
          setSelectedIds(productTags.map((tag) => tag.id));
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
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
    setSelectedIds((current) => current.includes(tagId)
      ? current.filter((value) => value !== tagId)
      : [...current, tagId]);
    setMessage("");
    setError("");
  }

  function resetSelection() {
    setSelectedIds(selected.map((tag) => tag.id));
    setMessage("");
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await setProductTags(id, selectedIds);
      setSelectedIds(saved.map((tag) => tag.id));
      setMessage(`Đã lưu ${saved.length} tag cho sản phẩm.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu tags.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="up-admin-empty">Đang tải product tags…</div>;
  if (!product) return <div className="up-admin-empty">{error || "Không tìm thấy sản phẩm."}</div>;

  return (
    <div className="up-product-tags-page">
      <header className="up-product-tags-header">
        <div className="up-product-tags-title">
          <Link className="up-product-tags-back" to="/admin/products/$id" params={{ id }} aria-label="Quay lại chi tiết sản phẩm">
            <ArrowLeft size={14} />
          </Link>
          <div>
            <div className="up-admin-kicker">CATALOG / PRODUCT / TAGS</div>
            <h1>{product.name}</h1>
            <p>Gán nhãn catalog cho sản phẩm · {selected.length} tag đang dùng</p>
          </div>
        </div>
        <div className="up-product-tags-header-actions">
          <Link className="up-admin-secondary" to="/admin/tags">QUẢN LÝ TAGS</Link>
          <button className="up-admin-primary" type="button" onClick={() => void save()} disabled={saving}>
            {saving ? "ĐANG LƯU…" : "LƯU TAGS"}
          </button>
        </div>
      </header>

      <section className="up-product-tags-shell">
        <div className="up-product-tags-bar">
          <div>
            <span className="up-product-tags-eyebrow">PRODUCT TAGS</span>
            <strong>Chọn tag</strong>
          </div>
          <span className="up-product-tags-count">{selected.length} / {tags.length}</span>
        </div>

        <div className="up-product-tags-selected-row">
          <span className="up-product-tags-label">ĐANG GÁN</span>
          <div className="up-product-tags-chips">
            {selected.length ? selected.map((tag) => (
              <button key={tag.id} type="button" className="up-product-tag-chip" onClick={() => toggle(tag.id)} title={`Bỏ ${tag.name}`}>
                {tag.name}<X size={11} />
              </button>
            )) : <span className="up-product-tags-none">Chưa có tag nào.</span>}
          </div>
        </div>

        <div className="up-product-tags-tools">
          <label className="up-product-tags-search">
            <Search size={14} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc slug…" aria-label="Tìm tag" />
          </label>
          <span className="up-product-tags-result">{filtered.length} kết quả</span>
        </div>

        <div className="up-product-tags-list-head">
          <span>L · LIST / R · READ</span>
          <span>ACTIVE TAGS</span>
        </div>

        <div className="up-product-tags-options">
          {filtered.length ? filtered.map((tag) => {
            const checked = selectedIds.includes(tag.id);
            return (
              <button type="button" key={tag.id} className={`up-product-tag-option ${checked ? "selected" : ""}`} onClick={() => toggle(tag.id)} aria-pressed={checked}>
                <span className="up-product-tag-check">{checked ? <Check size={11} /> : null}</span>
                <span className="up-product-tag-copy">
                  <strong>{tag.name}</strong>
                  <small>/{tag.slug}</small>
                </span>
                <span className="up-product-tag-usage">{tag.product_count}</span>
              </button>
            );
          }) : <div className="up-product-tags-empty">Không tìm thấy tag phù hợp.</div>}
        </div>

        <footer className="up-product-tags-footer">
          <span>Thay đổi chỉ được ghi vào Supabase sau khi lưu.</span>
          <div>
            <button className="up-secondary" type="button" onClick={resetSelection} disabled={saving}>KHÔI PHỤC</button>
            <button className="up-admin-primary" type="button" onClick={() => void save()} disabled={saving}>{saving ? "ĐANG LƯU…" : "LƯU THAY ĐỔI"}</button>
          </div>
        </footer>
        {(error || message) && <div className={`up-product-tags-feedback ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{error || message}</div>}
      </section>

      <style>{`
        .up-product-tags-page{display:grid;gap:14px;max-width:1180px}
        .up-product-tags-header{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:4px}
        .up-product-tags-title{display:flex;align-items:center;gap:12px;min-width:0}
        .up-product-tags-title h1{margin:5px 0 3px;font-size:30px;letter-spacing:-.045em;line-height:1.05}
        .up-product-tags-title p{margin:0;color:#7b7b76;font-size:11px}
        .up-product-tags-back{width:34px;height:34px;display:grid;place-items:center;border:1px solid #dddcd5;background:#fff;color:#555;text-decoration:none;flex:none}
        .up-product-tags-header-actions{display:flex;align-items:center;gap:7px;flex:none}
        .up-product-tags-shell{background:#fff;border:1px solid #dfded8;overflow:hidden}
        .up-product-tags-bar{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid #e7e6e1;background:#fafaf7}
        .up-product-tags-bar>div{display:flex;align-items:baseline;gap:10px}
        .up-product-tags-eyebrow{font-size:8px;letter-spacing:.16em;color:#8a8a84;font-weight:800}
        .up-product-tags-bar strong{font-size:13px;letter-spacing:-.01em}
        .up-product-tags-count{padding:4px 7px;background:#fff1c9;color:#876400;border:1px solid #f0d58a;font-size:9px;font-weight:800;letter-spacing:.08em}
        .up-product-tags-selected-row{display:flex;align-items:center;gap:15px;min-height:52px;padding:9px 18px;border-bottom:1px solid #eeeDE8}
        .up-product-tags-label{font-size:8px;font-weight:800;letter-spacing:.14em;color:#999994;flex:none}
        .up-product-tags-chips{display:flex;flex-wrap:wrap;gap:6px;min-width:0}
        .up-product-tag-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #e9bd4b;background:#fff8df;color:#654c12;padding:5px 7px;font-size:9px;cursor:pointer}
        .up-product-tag-chip:hover{background:#fff1c2}
        .up-product-tags-none{font-size:10px;color:#aaa}
        .up-product-tags-tools{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid #eeeDE8}
        .up-product-tags-search{display:flex;align-items:center;gap:7px;flex:1;border:1px solid #dddcd5;background:#fff;padding:0 9px;color:#999}
        .up-product-tags-search input{width:100%;border:0;outline:0;background:transparent;padding:8px 0;font-size:10px;color:#222}
        .up-product-tags-search input::placeholder{color:#aaa}
        .up-product-tags-result{font-size:9px;color:#999;white-space:nowrap}
        .up-product-tags-list-head{display:flex;justify-content:space-between;padding:8px 18px;background:#fcfcfa;color:#999;font-size:8px;letter-spacing:.13em;font-weight:800}
        .up-product-tags-options{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));max-height:390px;overflow:auto;border-top:1px solid #eeeDE8}
        .up-product-tag-option{display:grid;grid-template-columns:18px 1fr auto;align-items:center;gap:8px;min-height:54px;border:0;border-right:1px solid #eeeDE8;border-bottom:1px solid #eeeDE8;background:#fff;text-align:left;padding:9px 11px;cursor:pointer;transition:background .15s ease}
        .up-product-tag-option:hover{background:#fafaf7}
        .up-product-tag-option.selected{background:#fffaf0;box-shadow:inset 2px 0 #f2a900}
        .up-product-tag-check{width:17px;height:17px;display:grid;place-items:center;border:1px solid #d5d4ce;background:#fff;color:#fff}
        .up-product-tag-option.selected .up-product-tag-check{background:#f2a900;border-color:#f2a900}
        .up-product-tag-copy{min-width:0}
        .up-product-tag-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}
        .up-product-tag-copy small{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#999;font:8px ui-monospace,monospace}
        .up-product-tag-usage{min-width:20px;text-align:right;color:#a1a19b;font-size:8px}
        .up-product-tags-empty{grid-column:1/-1;padding:28px;text-align:center;color:#999;font-size:10px}
        .up-product-tags-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px;background:#fafaf7;color:#92928d;font-size:8px}
        .up-product-tags-footer>div{display:flex;gap:7px}
        .up-product-tags-feedback{padding:8px 18px;font-size:9px;border-top:1px solid #eeeDE8}
        .up-product-tags-feedback.error{color:#b4431d;background:#fff7f3}
        .up-product-tags-feedback.success{color:#2c5745;background:#f4faf6}
        @media(max-width:950px){.up-product-tags-options{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:760px){.up-product-tags-header{align-items:flex-start;flex-direction:column}.up-product-tags-header-actions{width:100%}.up-product-tags-header-actions>*{flex:1;justify-content:center}.up-product-tags-selected-row{align-items:flex-start;flex-direction:column;gap:7px}.up-product-tags-options{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:480px){.up-product-tags-options{grid-template-columns:1fr}.up-product-tags-tools{align-items:stretch;flex-direction:column}.up-product-tags-footer{align-items:flex-start;flex-direction:column}.up-product-tags-footer>div{width:100%}.up-product-tags-footer button{flex:1}}
      `}</style>
    </div>
  );
}
