import { createFileRoute } from "@tanstack/react-router";
import { Image, Megaphone, Eye, RotateCcw, Save, Share2, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { discardSiteContentDraft, publishSiteContent, readSiteContent, updateSiteContent, type SiteContentFields, type SiteContentSettings } from "@/lib/site-content";

export const Route = createFileRoute("/admin/content")({
  component: AdminContentPage,
  head: () => ({ meta: [{ title: "Content — UpThink Admin" }] }),
});

function fieldsFromSettings(value: SiteContentSettings): SiteContentFields {
  return {
    announcement_enabled: value.announcement_enabled,
    announcement_text: value.announcement_text,
    hero_eyebrow: value.hero_eyebrow,
    hero_title: value.hero_title,
    hero_description: value.hero_description,
    hero_cta_label: value.hero_cta_label,
    hero_cta_url: value.hero_cta_url,
    social_title: value.social_title,
    social_description: value.social_description,
    favicon_url: value.favicon_url,
    social_image_url: value.social_image_url,
  };
}

function sameFields(a: SiteContentFields, b: SiteContentFields | null | undefined) {
  if (!b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function AdminContentPage() {
  const [record, setRecord] = useState<SiteContentSettings | null>(null);
  const [form, setForm] = useState<SiteContentFields | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<"save" | "publish" | "discard" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void readSiteContent()
      .then((next) => { if (next) { setRecord(next); setForm(fieldsFromSettings(next)); } })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load content settings."));
  }, []);

  const isDirty = useMemo(() => Boolean(form && !sameFields(form, record?.draft_content)), [form, record]);
  const isPublished = useMemo(() => Boolean(record?.draft_content && sameFields(record.draft_content, record.published_content)), [record]);

  function patch(values: Partial<SiteContentFields>) {
    setSaved(false); setError(null); setForm((current) => current ? { ...current, ...values } : current);
  }

  async function saveDraft() {
    if (!form) return;
    if (!form.hero_title.trim() || !form.hero_cta_label.trim() || !form.hero_cta_url.trim()) {
      setError("Hero title, CTA label and CTA URL are required."); return;
    }
    setBusy("save"); setSaved(false); setError(null);
    try {
      const next = await updateSiteContent(form);
      setRecord(next); setForm(fieldsFromSettings(next)); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save content draft."); }
    finally { setBusy(null); }
  }

  async function previewDraft() {
    if (!form) return;
    const params = new URLSearchParams({ content_preview: "1", content_data: JSON.stringify(form) });
    window.open(`/?${params.toString()}`, "_blank", "noopener,noreferrer");
  }

  async function publishDraft() {
    if (!form) return;
    if (isDirty) { setError("Save the draft before publishing it."); return; }
    if (!window.confirm("Publish this content draft to the public storefront?")) return;
    setBusy("publish"); setSaved(false); setError(null);
    try {
      const next = await publishSiteContent();
      setRecord(next); setForm(fieldsFromSettings(next)); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to publish content."); }
    finally { setBusy(null); }
  }

  async function discardDraft() {
    if (!window.confirm("Discard the saved content draft and restore the currently published content?")) return;
    setBusy("discard"); setSaved(false); setError(null);
    try {
      const next = await discardSiteContentDraft();
      setRecord(next); setForm(fieldsFromSettings(next)); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to discard content draft."); }
    finally { setBusy(null); }
  }

  if (!form || !record) return <div className="up-content-page"><div className="up-content-loading">Loading content settings…</div></div>;

  return (
    <div className="up-content-page">
      <style>{`
        .up-content-page{display:grid;gap:14px;min-width:0}.up-content-header{display:flex;justify-content:space-between;align-items:flex-end;gap:18px}.up-content-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:#858681}.up-content-header h1{margin:6px 0 4px;font-size:32px;letter-spacing:-.04em}.up-content-header p{margin:0;color:#777;font-size:12px;line-height:1.5}.up-content-status-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.up-content-status{display:inline-flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid #deddd7;background:#fafaf7;font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#777}.up-content-status.draft{color:#58738C;background:#eef3f7;border-color:#d6e0e8}.up-content-status.live{color:#2c5745;background:#edf4f0;border-color:#d5e5dc}.up-content-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.up-content-action{display:inline-flex;align-items:center;gap:6px;border:1px solid #dddcd5;background:#fff;color:#555;padding:10px 12px;font-size:8px;font-weight:900;letter-spacing:.06em;cursor:pointer}.up-content-action.primary{background:#1b1a17;border-color:#1b1a17;color:#fff}.up-content-action.publish{background:#f2a900;border-color:#f2a900;color:#111}.up-content-action:disabled{opacity:.5;cursor:wait}.up-content-error{padding:10px 12px;border:1px solid #f0c4c0;background:#fff0ef;color:#a32727;font-size:10px}.up-content-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.62fr);gap:14px;align-items:start}.up-content-main{display:grid;gap:14px}.up-content-panel{background:#fff;border:1px solid #e3e2dc;padding:17px}.up-content-panel h2{display:flex;align-items:center;gap:8px;margin:0 0 4px;font-size:15px}.up-content-panel h2 svg{color:#f2a900}.up-content-panel>p{margin:0 0 13px;color:#888;font-size:10px;line-height:1.5}.up-content-form{display:grid;gap:10px}.up-content-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.up-content-field{display:grid;gap:5px}.up-content-field label{font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.up-content-field input,.up-content-field textarea{width:100%;box-sizing:border-box;border:1px solid #dddcd5;background:#fff;padding:9px 10px;font-size:11px;outline:none}.up-content-field textarea{min-height:76px;resize:vertical;line-height:1.5}.up-content-field input:focus,.up-content-field textarea:focus{border-color:#b7b6ae}.up-content-toggle{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:10px;background:#fafaf7;border:1px solid #eeeDE8}.up-content-toggle span{font-size:10px;color:#555}.up-content-toggle input{accent-color:#f2a900;width:16px;height:16px}.up-content-preview{position:sticky;top:20px;background:#1b1a17;color:#f7f1e7;border:1px solid #292824;min-height:330px;overflow:hidden}.up-content-preview-bar{background:#f2a900;color:#111;padding:7px 12px;font-size:8px;font-weight:900;letter-spacing:.08em}.up-content-preview-body{padding:28px 22px;display:grid;gap:13px}.up-content-preview small{font-size:8px;letter-spacing:.16em;color:#f2a900}.up-content-preview h2{font-size:29px;line-height:.98;letter-spacing:-.045em;margin:0;max-width:360px}.up-content-preview p{font-size:10px;line-height:1.6;color:#d6d2c8;max-width:390px;margin:0}.up-content-preview a{display:inline-flex;width:max-content;padding:10px 13px;background:#f2a900;color:#111;text-decoration:none;font-size:8px;font-weight:900;letter-spacing:.08em}.up-content-preview-meta{border-top:1px solid rgba(255,255,255,.12);padding-top:11px;font-size:8px;color:#999}.up-content-note{font-size:9px;color:#888;line-height:1.5}.up-content-loading{padding:40px;text-align:center;color:#777}@media(max-width:820px){.up-content-grid{grid-template-columns:1fr}.up-content-preview{position:relative;top:auto}.up-content-two{grid-template-columns:1fr}.up-content-header{align-items:flex-start;flex-direction:column}.up-content-actions{justify-content:flex-start}}@media(max-width:560px){.up-content-action{flex:1;justify-content:center}}
      `}</style>

      <header className="up-content-header">
        <div><div className="up-content-kicker">SYSTEM / BRAND & COMMERCE CONTENT</div><h1>Content Studio</h1><p>Edit safely in draft, preview it on the storefront, then publish when ready.</p><div className="up-content-status-row"><span className={`up-content-status${isDirty ? " draft" : ""}`}>{isDirty ? "● Unsaved editor changes" : "● Draft saved"}</span><span className={`up-content-status${isPublished ? " live" : " draft"}`}>{isPublished ? "● Published = Draft" : "● Draft differs from live"}</span></div></div>
        <div className="up-content-actions"><button className="up-content-action" type="button" onClick={() => void previewDraft()}><Eye size={12}/>Preview</button><button className="up-content-action" type="button" onClick={() => void discardDraft()} disabled={busy !== null}><RotateCcw size={12}/>{busy === "discard" ? "DISCARDING…" : "Discard"}</button><button className="up-content-action primary" type="button" onClick={() => void saveDraft()} disabled={busy !== null || !isDirty}><Save size={12}/>{busy === "save" ? "SAVING…" : saved ? "SAVED" : "SAVE DRAFT"}</button><button className="up-content-action publish" type="button" onClick={() => void publishDraft()} disabled={busy !== null || isDirty || isPublished}><UploadCloud size={12}/>{busy === "publish" ? "PUBLISHING…" : "PUBLISH"}</button></div>
      </header>
      {error && <div className="up-content-error">{error}</div>}

      <div className="up-content-grid">
        <div className="up-content-main">
          <section className="up-content-panel"><h2><Megaphone size={15}/>Announcement Bar</h2><p>Prepare a compact site-wide message for launches, shipping notices or campaigns.</p><div className="up-content-form"><div className="up-content-toggle"><span>Show announcement bar</span><input type="checkbox" checked={form.announcement_enabled} onChange={(e)=>patch({announcement_enabled:e.target.checked})}/></div><div className="up-content-field"><label>Announcement text</label><input value={form.announcement_text} maxLength={140} onChange={(e)=>patch({announcement_text:e.target.value})} placeholder="FREE SHIPPING · NEW DROP 01"/></div></div></section>
          <section className="up-content-panel"><h2><Sparkles size={15}/>Homepage Hero</h2><p>Control editorial copy and CTA destinations while keeping the existing hero composition intact.</p><div className="up-content-form"><div className="up-content-field"><label>Eyebrow</label><input value={form.hero_eyebrow} maxLength={80} onChange={(e)=>patch({hero_eyebrow:e.target.value})}/></div><div className="up-content-field"><label>Hero title</label><input value={form.hero_title} maxLength={120} onChange={(e)=>patch({hero_title:e.target.value})}/></div><div className="up-content-field"><label>Description</label><textarea value={form.hero_description} maxLength={280} onChange={(e)=>patch({hero_description:e.target.value})}/></div><div className="up-content-two"><div className="up-content-field"><label>CTA label</label><input value={form.hero_cta_label} maxLength={50} onChange={(e)=>patch({hero_cta_label:e.target.value})}/></div><div className="up-content-field"><label>CTA URL</label><input value={form.hero_cta_url} maxLength={200} onChange={(e)=>patch({hero_cta_url:e.target.value})}/></div></div></div></section>
          <section className="up-content-panel"><h2><Share2 size={15}/>Social Preview</h2><p>Define metadata used when the storefront is shared. Image URLs are stored as references; uploads can be added later through Brand Assets.</p><div className="up-content-form"><div className="up-content-field"><label>Social title</label><input value={form.social_title} maxLength={120} onChange={(e)=>patch({social_title:e.target.value})}/></div><div className="up-content-field"><label>Social description</label><textarea value={form.social_description} maxLength={280} onChange={(e)=>patch({social_description:e.target.value})}/></div><div className="up-content-two"><div className="up-content-field"><label>Favicon URL</label><input value={form.favicon_url ?? ""} onChange={(e)=>patch({favicon_url:e.target.value || null})} placeholder="https://…"/></div><div className="up-content-field"><label>Social image URL</label><input value={form.social_image_url ?? ""} onChange={(e)=>patch({social_image_url:e.target.value || null})} placeholder="https://…"/></div></div></div></section>
        </div>

        <aside className="up-content-preview"><div className="up-content-preview-bar">{form.announcement_enabled ? (form.announcement_text || "ANNOUNCEMENT") : "WEARO / DRAFT PREVIEW"}</div><div className="up-content-preview-body"><small>{form.hero_eyebrow}</small><h2>{form.hero_title}</h2><p>{form.hero_description}</p><a href={form.hero_cta_url}>{form.hero_cta_label}</a><div className="up-content-preview-meta"><strong>{form.social_title}</strong><br/>{form.social_description}</div></div></aside>
      </div>
      <div className="up-content-note"><Image size={11} style={{verticalAlign:"-2px",marginRight:5}}/> Flow: Draft → Preview → Publish. Discard restores the published snapshot. Content publication is separate from theme color publication so each change remains explicit.</div>
    </div>
  );
}
