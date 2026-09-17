import { createFileRoute } from "@tanstack/react-router";
import { Archive, Check, Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createAdminTag, deleteAdminTag, listAdminTags, updateAdminTag, type AdminTag, type TagStatus } from "@/lib/admin-tags";

export const Route = createFileRoute("/admin/tags")({
  component: AdminTagsPage,
  head: () => ({ meta: [{ title: "Tags — Admin — WEARO" }] }),
});

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function AdminTagsPage() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TagStatus>("active");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | TagStatus>("all");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slugEdited, setSlugEdited] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload(selectId?: string | null) {
    setLoading(true); setError(null);
    try {
      const rows = await listAdminTags();
      setTags(rows);
      if (selectId) selectTag(rows.find((tag) => tag.id === selectId) ?? null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tải tags."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void reload(); }, []);

  function selectTag(tag: AdminTag | null) {
    setSelectedId(tag?.id ?? null); setName(tag?.name ?? ""); setSlug(tag?.slug ?? ""); setDescription(tag?.description ?? ""); setStatus(tag?.status ?? "active"); setSlugEdited(Boolean(tag)); setMessage(null); setError(null);
  }

  function newTag() { selectTag(null); setSlugEdited(false); setMessage("Đang tạo tag mới."); }

  function handleName(value: string) { setName(value); if (!slugEdited) setSlug(slugify(value)); }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tags.filter((tag) => (filter === "all" || tag.status === filter) && (!q || `${tag.name} ${tag.slug} ${tag.description ?? ""}`.toLowerCase().includes(q)));
  }, [tags, search, filter]);

  const activeCount = tags.filter((tag) => tag.status === "active").length;
  const archivedCount = tags.filter((tag) => tag.status === "archived").length;
  const totalProductsTagged = tags.reduce((sum, tag) => sum + tag.product_count, 0);

  async function save() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!name.trim() || !slug.trim()) throw new Error("Tên và slug của tag là bắt buộc.");
      const payload = { name, slug: slugify(slug), description: description.trim() || null, status };
      const saved = selectedId ? await updateAdminTag(selectedId, payload) : await createAdminTag(payload);
      await reload(saved.id); setMessage(selectedId ? `Đã cập nhật “${saved.name}”.` : `Đã tạo “${saved.name}”.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu tag."); }
    finally { setBusy(false); }
  }

  async function archiveOrRestore(tag: AdminTag) {
    setBusy(true); setError(null); setMessage(null);
    try { const updated = await updateAdminTag(tag.id, { status: tag.status === "active" ? "archived" : "active" }); setTags((current) => current.map((item) => item.id === updated.id ? updated : item)); if (selectedId === updated.id) setStatus(updated.status); setMessage(updated.status === "archived" ? `Đã lưu trữ “${updated.name}”.` : `Đã khôi phục “${updated.name}”.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái tag."); }
    finally { setBusy(false); }
  }

  async function remove(tag: AdminTag) {
    if (!window.confirm(`Xóa tag “${tag.name}”? Các liên kết product-tag của tag này cũng sẽ bị xóa.`)) return;
    setBusy(true); setError(null); setMessage(null);
    try { await deleteAdminTag(tag.id); setTags((current) => current.filter((item) => item.id !== tag.id)); if (selectedId === tag.id) selectTag(null); setMessage(`Đã xóa “${tag.name}”.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể xóa tag."); }
    finally { setBusy(false); }
  }

  return <div className="up-tags-page">
    <style>{`
      .up-tags-page{display:grid;gap:18px}.up-tags-header{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}.up-tags-header h1{margin:7px 0 5px;font-size:34px;letter-spacing:-.04em}.up-tags-header p{margin:0;color:#777;font-size:13px}.up-tags-layout{display:grid;grid-template-columns:minmax(300px,.8fr) minmax(0,1.45fr);gap:16px;align-items:start}.up-tags-panel{background:#fff;border:1px solid #e3e2dc}.up-tags-panel-head{padding:18px;border-bottom:1px solid #e3e2dc;display:flex;justify-content:space-between;align-items:center;gap:12px}.up-tags-panel-head h2{margin:0;font-size:14px}.up-tags-list{display:grid}.up-tag-row{padding:14px 16px;border:0;border-bottom:1px solid #eeeDE8;background:#fff;text-align:left;cursor:pointer}.up-tag-row:hover,.up-tag-row.active{background:#fafaf7}.up-tag-row.active{box-shadow:inset 3px 0 #f2a900}.up-tag-row-top{display:flex;justify-content:space-between;gap:10px}.up-tag-name{font-weight:800;font-size:12px}.up-tag-slug{display:block;margin-top:4px;color:#999;font:10px ui-monospace,monospace}.up-tag-meta{display:flex;justify-content:space-between;gap:8px;margin-top:9px;color:#888;font-size:9px}.up-tag-status{padding:3px 6px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.up-tag-status.active{background:#def4e8;color:#167243}.up-tag-status.archived{background:#e7e7e5;color:#6b6c68}.up-tags-toolbar{display:flex;gap:8px;padding:14px;border-bottom:1px solid #e3e2dc}.up-tags-toolbar input,.up-tags-toolbar select,.up-tag-editor input,.up-tag-editor textarea,.up-tag-editor select{width:100%;border:1px solid #dddcd5;background:#fff;padding:11px 12px;outline:none}.up-tags-toolbar input{flex:1}.up-tag-editor{padding:22px}.up-tag-editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.up-tag-field{display:grid;gap:7px}.up-tag-field.full{grid-column:1/-1}.up-tag-field label{font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#777}.up-tag-field textarea{min-height:105px;resize:vertical}.up-tag-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.up-tag-icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid #dddcd5;background:#fff;cursor:pointer}.up-tag-icon.danger{color:#c52d2d}.up-tag-empty{padding:35px;text-align:center;color:#888;font-size:11px}.up-tags-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.up-tags-stat{background:#fff;border:1px solid #e3e2dc;padding:16px 18px}.up-tags-stat span{display:block;color:#898a86;font-size:9px;letter-spacing:.13em}.up-tags-stat strong{display:block;font-size:23px;margin-top:8px}.up-tag-helper{color:#999;font-size:10px;line-height:1.5}.up-tag-feedback{font-size:11px;margin-top:10px}.up-tag-feedback.error{color:#c44b1d}.up-tag-feedback.success{color:#2c5745}@media(max-width:850px){.up-tags-layout{grid-template-columns:1fr}.up-tag-editor-grid{grid-template-columns:1fr}.up-tag-field.full{grid-column:auto}.up-tags-stats{grid-template-columns:1fr 1fr}.up-tags-header{align-items:flex-start;flex-direction:column}}
    `}</style>
    <header className="up-tags-header"><div><div className="up-admin-kicker">WEARO / ADMIN / CATALOG / TAGS</div><h1>Tags</h1><p>Quản lý nhãn catalog qua Python Admin API và Supabase.</p></div><button type="button" className="up-admin-primary" onClick={newTag}><Plus size={13}/> NEW TAG</button></header>
    <section className="up-tags-stats"><div className="up-tags-stat"><span>TOTAL TAGS</span><strong>{tags.length}</strong></div><div className="up-tags-stat"><span>ACTIVE</span><strong>{activeCount}</strong></div><div className="up-tags-stat"><span>PRODUCT LINKS</span><strong>{totalProductsTagged}</strong></div></section>
    <div className="up-tags-layout">
      <section className="up-tags-panel"><div className="up-tags-panel-head"><h2>L · LIST TAGS</h2><span className="up-tag-helper">{filtered.length}/{tags.length}</span></div><div className="up-tags-toolbar"><div style={{position:"relative",flex:1}}><Search size={13} style={{position:"absolute",left:9,top:11,color:"#999"}}/><input style={{paddingLeft:29}} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Tìm tag…"/></div><select value={filter} onChange={(e)=>setFilter(e.target.value as "all"|TagStatus)}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></div><div className="up-tags-list">{loading?<div className="up-tag-empty">Đang tải…</div>:filtered.length?filtered.map((tag)=><button type="button" key={tag.id} className={`up-tag-row ${selectedId===tag.id?"active":""}`} onClick={()=>selectTag(tag)}><div className="up-tag-row-top"><span className="up-tag-name">{tag.name}</span><span className={`up-tag-status ${tag.status}`}>{tag.status}</span></div><span className="up-tag-slug">/{tag.slug}</span><div className="up-tag-meta"><span>{tag.product_count} products</span><span>{new Date(tag.updated_at).toLocaleDateString("vi-VN")}</span></div></button>):<div className="up-tag-empty">Không có tag phù hợp.</div>}</div></section>
      <section className="up-tags-panel"><div className="up-tags-panel-head"><h2>{selectedId ? "R · READ / U · UPDATE" : "C · CREATE TAG"}</h2>{selectedId&&<span className="up-tag-helper">ID: {selectedId}</span>}</div>{selectedId||name?<div className="up-tag-editor"><div className="up-tag-editor-grid"><div className="up-tag-field"><label>Name</label><input value={name} onChange={(e)=>handleName(e.target.value)} placeholder="AI Try-On" maxLength={60}/></div><div className="up-tag-field"><label>Slug</label><input value={slug} onChange={(e)=>{setSlug(e.target.value);setSlugEdited(true)}} placeholder="ai-try-on"/></div><div className="up-tag-field"><label>Status</label><select value={status} onChange={(e)=>setStatus(e.target.value as TagStatus)}><option value="active">Active</option><option value="archived">Archived</option></select></div><div className="up-tag-field"><label>Products</label><div style={{border:"1px solid #dddcd5",padding:"11px 12px",fontSize:12}}>{selectedId?tags.find((tag)=>tag.id===selectedId)?.product_count??0:0} linked products</div></div><div className="up-tag-field full"><label>Description</label><textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Mô tả cách tag được sử dụng trong catalog…"/></div></div><div className="up-tag-helper" style={{marginTop:14}}>Python chịu trách nhiệm validate slug, kiểm tra trùng, quyền admin và ghi dữ liệu vào Supabase. UI không truy cập bảng tags trực tiếp.</div><div className="up-tag-actions">{selectedId&&<><button type="button" className="up-tag-icon" title={status==="active"?"Archive":"Restore"} onClick={()=>{const tag=tags.find((item)=>item.id===selectedId);if(tag)void archiveOrRestore(tag)}} disabled={busy}>{status==="active"?<Archive size={14}/>:<RotateCcw size={14}/>}</button><button type="button" className="up-tag-icon danger" title="Delete" onClick={()=>{const tag=tags.find((item)=>item.id===selectedId);if(tag)void remove(tag)}} disabled={busy}><Trash2 size={14}/></button></>}<button type="button" className="up-secondary" onClick={()=>selectTag(null)} disabled={busy}><X size={13}/> CANCEL</button><button type="button" className="up-admin-primary" onClick={()=>void save()} disabled={busy}>{busy?"SAVING…":selectedId?<><Check size={13}/> UPDATE</>:<><Check size={13}/> CREATE</>}</button></div>{error&&<div className="up-tag-feedback error">{error}</div>}{message&&<div className="up-tag-feedback success">{message}</div>}</div>:<div className="up-tag-empty"><Pencil size={18} style={{marginBottom:8}}/><br/>Chọn một tag để đọc/chỉnh sửa hoặc bấm NEW TAG để tạo.</div>}</section>
    </div>
  </div>;
}
