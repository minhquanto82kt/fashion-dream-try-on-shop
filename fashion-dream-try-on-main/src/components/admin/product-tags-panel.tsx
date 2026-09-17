import { Check, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listAdminTags, type AdminTag } from "@/lib/admin-tags";
import { getProductTags, setProductTags } from "@/lib/admin-product-tags";

type Props = { productId: string };

export function ProductTagsPanel({ productId }: Props) {
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
        const [allTags, productTags] = await Promise.all([listAdminTags("active"), getProductTags(productId)]);
        if (!cancelled) {
          setTags(allTags);
          setSelectedIds(productTags.map((tag) => tag.id));
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Không thể tải tags của sản phẩm.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [productId]);

  const selected = useMemo(() => tags.filter((tag) => selectedIds.includes(tag.id)), [tags, selectedIds]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tags.filter((tag) => !query || `${tag.name} ${tag.slug}`.toLowerCase().includes(query));
  }, [tags, search]);

  function toggle(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setMessage("");
  }

  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      const saved = await setProductTags(productId, selectedIds);
      setSelectedIds(saved.map((tag) => tag.id));
      setMessage(`Đã cập nhật ${saved.length} tag cho sản phẩm.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật product tags.");
    } finally { setSaving(false); }
  }

  return (
    <section className="up-admin-card up-product-tags-panel">
      <div className="up-product-tags-head">
        <div>
          <div className="up-admin-kicker">CATALOG / RELATIONSHIP</div>
          <h2>Product Tags</h2>
          <p>Gán các tag đang hoạt động cho sản phẩm. Thay đổi chỉ được ghi khi bấm Save.</p>
        </div>
        <span className="up-product-tags-count">{selected.length} TAGS</span>
      </div>

      <div className="up-product-tags-selected">
        {selected.length ? selected.map((tag) => (
          <button key={tag.id} type="button" className="up-product-tag-chip" onClick={() => toggle(tag.id)} title="Bỏ tag">
            {tag.name}<X size={11} />
          </button>
        )) : <span>Chưa có tag nào được gán.</span>}
      </div>

      <div className="up-product-tags-toolbar">
        <div className="up-product-tags-search"><Search size={13} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tag để gán…" /></div>
        <a className="up-product-tags-manage" href="/admin/tags"><Plus size={12} /> MANAGE TAGS</a>
      </div>

      <div className="up-product-tags-options">
        {loading ? <div className="up-admin-empty">Đang tải tags…</div> : filtered.length ? filtered.map((tag) => {
          const checked = selectedIds.includes(tag.id);
          return <button key={tag.id} type="button" className={`up-product-tag-option ${checked ? "selected" : ""}`} onClick={() => toggle(tag.id)}>
            <span className="up-product-tag-check">{checked ? <Check size={11} /> : null}</span>
            <span><strong>{tag.name}</strong><small>/{tag.slug}</small></span>
          </button>;
        }) : <div className="up-admin-empty">Không tìm thấy tag.</div>}
      </div>

      <div className="up-product-tags-footer">
        <span className="up-tag-helper">Python validates product/tag existence and blocks archived tags.</span>
        <button type="button" className="up-admin-primary" onClick={() => void save()} disabled={loading || saving}>{saving ? "SAVING…" : "SAVE TAGS"}</button>
      </div>
      {error && <div className="up-tag-feedback error">{error}</div>}
      {message && <div className="up-tag-feedback success">{message}</div>}

      <style>{`
        .up-product-tags-panel{margin-top:18px;padding:0;overflow:hidden}.up-product-tags-head{padding:20px 22px;border-bottom:1px solid #e3e2dc;display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.up-product-tags-head h2{margin:6px 0 5px;font-size:20px;letter-spacing:-.02em}.up-product-tags-head p{margin:0;color:#858681;font-size:11px;line-height:1.5}.up-product-tags-count{font-size:9px;letter-spacing:.12em;color:#607080;background:#edf2f5;border:1px solid #d7e0e6;padding:5px 7px;white-space:nowrap}.up-product-tags-selected{display:flex;flex-wrap:wrap;gap:7px;min-height:54px;padding:12px 22px;border-bottom:1px solid #eeeDE8}.up-product-tags-selected>span{align-self:center;color:#999;font-size:11px}.up-product-tag-chip{display:inline-flex;align-items:center;gap:7px;border:1px solid #efc15a;background:#fff9e9;padding:6px 8px;font-size:10px;color:#654c12;cursor:pointer}.up-product-tags-toolbar{display:flex;gap:10px;padding:12px 22px;border-bottom:1px solid #eeeDE8}.up-product-tags-search{flex:1;display:flex;align-items:center;gap:8px;border:1px solid #dddcd5;padding:0 10px}.up-product-tags-search svg{color:#999;flex:none}.up-product-tags-search input{border:0;outline:0;width:100%;padding:9px 0;font-size:11px}.up-product-tags-manage{display:inline-flex;align-items:center;gap:5px;border:1px solid #dddcd5;padding:0 11px;font-size:9px;letter-spacing:.08em;color:#555;text-decoration:none}.up-product-tags-options{display:grid;grid-template-columns:repeat(3,1fr);max-height:190px;overflow:auto}.up-product-tag-option{display:flex;align-items:center;gap:9px;border:0;border-right:1px solid #eeeDE8;border-bottom:1px solid #eeeDE8;background:#fff;text-align:left;padding:12px 14px;cursor:pointer}.up-product-tag-option:hover,.up-product-tag-option.selected{background:#fafaf7}.up-product-tag-check{width:18px;height:18px;display:grid;place-items:center;border:1px solid #d3d2cc;color:#fff;background:#fff;flex:none}.up-product-tag-option.selected .up-product-tag-check{background:#f2a900;border-color:#f2a900}.up-product-tag-option strong{display:block;font-size:10px}.up-product-tag-option small{display:block;margin-top:3px;color:#999;font:9px ui-monospace,monospace}.up-product-tags-footer{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:14px 22px;background:#fafaf7}.up-tag-helper{font-size:9px;color:#92938e;line-height:1.5}.up-tag-feedback{padding:0 22px 14px;font-size:10px}.up-tag-feedback.error{color:#c44b1d}.up-tag-feedback.success{color:#2c5745}@media(max-width:800px){.up-product-tags-options{grid-template-columns:1fr 1fr}.up-product-tags-toolbar{flex-direction:column}.up-product-tags-manage{min-height:36px;justify-content:center}}@media(max-width:520px){.up-product-tags-options{grid-template-columns:1fr}.up-product-tags-head{flex-direction:column}.up-product-tags-footer{align-items:flex-start;flex-direction:column}}
      `}</style>
    </section>
  );
}
