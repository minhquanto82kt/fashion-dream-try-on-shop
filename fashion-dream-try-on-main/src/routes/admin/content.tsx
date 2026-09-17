import { createFileRoute } from "@tanstack/react-router";
import { Image, Megaphone, Save, Share2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { readSiteContent, updateSiteContent, type SiteContentSettings } from "@/lib/site-content";

export const Route = createFileRoute("/admin/content")({
  component: AdminContentPage,
  head: () => ({ meta: [{ title: "Content — UpThink Admin" }] }),
});

function AdminContentPage() {
  const [form, setForm] = useState<SiteContentSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void readSiteContent().then(setForm).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load content settings."));
  }, []);

  function patch(values: Partial<SiteContentSettings>) {
    setSaved(false); setError(null); setForm((current) => current ? { ...current, ...values } : current);
  }

  async function save() {
    if (!form) return;
    if (!form.hero_title.trim() || !form.hero_cta_label.trim() || !form.hero_cta_url.trim()) {
      setError("Hero title, CTA label and CTA URL are required."); return;
    }
    setBusy(true); setSaved(false); setError(null);
    try {
      const next = await updateSiteContent({
        announcement_enabled: form.announcement_enabled,
        announcement_text: form.announcement_text,
        hero_eyebrow: form.hero_eyebrow,
        hero_title: form.hero_title,
        hero_description: form.hero_description,
        hero_cta_label: form.hero_cta_label,
        hero_cta_url: form.hero_cta_url,
        social_title: form.social_title,
        social_description: form.social_description,
        favicon_url: form.favicon_url,
        social_image_url: form.social_image_url,
      });
      setForm(next); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save content settings."); }
    finally { setBusy(false); }
  }

  if (!form) return <div className="up-content-page"><div className="up-content-loading">Loading content settings…</div></div>;

  return (
    <div className="up-content-page">
      <style>{`
        .up-content-page{display:grid;gap:14px;min-width:0}.up-content-header{display:flex;justify-content:space-between;align-items:flex-end;gap:18px}.up-content-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:#858681}.up-content-header h1{margin:6px 0 4px;font-size:32px;letter-spacing:-.04em}.up-content-header p{margin:0;color:#777;font-size:12px;line-height:1.5}.up-content-save{display:inline-flex;align-items:center;gap:7px;border:0;background:#f2a900;color:#111;padding:11px 15px;font-size:9px;font-weight:900;letter-spacing:.08em;cursor:pointer}.up-content-save:disabled{opacity:.55;cursor:wait}.up-content-status{font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2c5745;margin-top:7px}.up-content-error{padding:10px 12px;border:1px solid #f0c4c0;background:#fff0ef;color:#a32727;font-size:10px}.up-content-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.62fr);gap:14px;align-items:start}.up-content-main{display:grid;gap:14px}.up-content-panel{background:#fff;border:1px solid #e3e2dc;padding:17px}.up-content-panel h2{display:flex;align-items:center;gap:8px;margin:0 0 4px;font-size:15px}.up-content-panel h2 svg{color:#f2a900}.up-content-panel>p{margin:0 0 13px;color:#888;font-size:10px;line-height:1.5}.up-content-form{display:grid;gap:10px}.up-content-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.up-content-field{display:grid;gap:5px}.up-content-field label{font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.up-content-field input,.up-content-field textarea{width:100%;border:1px solid #dddcd5;background:#fff;padding:9px 10px;font-size:11px;outline:none}.up-content-field textarea{min-height:76px;resize:vertical;line-height:1.5}.up-content-field input:focus,.up-content-field textarea:focus{border-color:#b7b6ae}.up-content-toggle{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:10px;background:#fafaf7;border:1px solid #eeeDE8}.up-content-toggle span{font-size:10px;color:#555}.up-content-toggle input{accent-color:#f2a900;width:16px;height:16px}.up-content-preview{position:sticky;top:20px;background:#1b1a17;color:#f7f1e7;border:1px solid #292824;min-height:330px;overflow:hidden}.up-content-preview-bar{background:#f2a900;color:#111;padding:7px 12px;font-size:8px;font-weight:900;letter-spacing:.08em}.up-content-preview-body{padding:28px 22px;display:grid;gap:13px}.up-content-preview small{font-size:8px;letter-spacing:.16em;color:#f2a900}.up-content-preview h2{font-size:29px;line-height:.98;letter-spacing:-.045em;margin:0;max-width:360px}.up-content-preview p{font-size:10px;line-height:1.6;color:#d6d2c8;max-width:390px;margin:0}.up-content-preview a{display:inline-flex;width:max-content;padding:10px 13px;background:#f2a900;color:#111;text-decoration:none;font-size:8px;font-weight:900;letter-spacing:.08em}.up-content-preview-meta{border-top:1px solid rgba(255,255,255,.12);padding-top:11px;font-size:8px;color:#999}.up-content-note{font-size:9px;color:#888;line-height:1.5}.up-content-loading{padding:40px;text-align:center;color:#777}@media(max-width:820px){.up-content-grid{grid-template-columns:1fr}.up-content-preview{position:relative;top:auto}.up-content-two{grid-template-columns:1fr}}@media(max-width:560px){.up-content-header{align-items:flex-start;flex-direction:column}}
      `}</style>

      <header className="up-content-header">
        <div><div className="up-content-kicker">SYSTEM / BRAND & COMMERCE CONTENT</div><h1>Content Studio</h1><p>Control lightweight brand, announcement, hero and social metadata without touching the storefront layout.</p>{saved && <div className="up-content-status">✓ Saved to Supabase</div>}</div>
        <button className="up-content-save" type="button" onClick={() => void save()} disabled={busy}><Save size={12}/>{busy ? "SAVING…" : "SAVE CHANGES"}</button>
      </header>
      {error && <div className="up-content-error">{error}</div>}

      <div className="up-content-grid">
        <div className="up-content-main">
          <section className="up-content-panel"><h2><Megaphone size={15}/>Announcement Bar</h2><p>Prepare a compact site-wide message for launches, shipping notices or campaigns.</p><div className="up-content-form"><div className="up-content-toggle"><span>Show announcement bar</span><input type="checkbox" checked={form.announcement_enabled} onChange={(e)=>patch({announcement_enabled:e.target.checked})}/></div><div className="up-content-field"><label>Announcement text</label><input value={form.announcement_text} maxLength={140} onChange={(e)=>patch({announcement_text:e.target.value})} placeholder="FREE SHIPPING · NEW DROP 01"/></div></div></section>
          <section className="up-content-panel"><h2><Sparkles size={15}/>Homepage Hero</h2><p>Control editorial copy and CTA destinations while keeping the existing hero composition intact.</p><div className="up-content-form"><div className="up-content-field"><label>Eyebrow</label><input value={form.hero_eyebrow} maxLength={80} onChange={(e)=>patch({hero_eyebrow:e.target.value})}/></div><div className="up-content-field"><label>Hero title</label><input value={form.hero_title} maxLength={120} onChange={(e)=>patch({hero_title:e.target.value})}/></div><div className="up-content-field"><label>Description</label><textarea value={form.hero_description} maxLength={280} onChange={(e)=>patch({hero_description:e.target.value})}/></div><div className="up-content-two"><div className="up-content-field"><label>CTA label</label><input value={form.hero_cta_label} maxLength={50} onChange={(e)=>patch({hero_cta_label:e.target.value})}/></div><div className="up-content-field"><label>CTA URL</label><input value={form.hero_cta_url} maxLength={200} onChange={(e)=>patch({hero_cta_url:e.target.value})}/></div></div></div></section>
          <section className="up-content-panel"><h2><Share2 size={15}/>Social Preview</h2><p>Define metadata used when the storefront is shared. Image URLs are stored as references; uploads can be added later through Brand Assets.</p><div className="up-content-form"><div className="up-content-field"><label>Social title</label><input value={form.social_title} maxLength={120} onChange={(e)=>patch({social_title:e.target.value})}/></div><div className="up-content-field"><label>Social description</label><textarea value={form.social_description} maxLength={280} onChange={(e)=>patch({social_description:e.target.value})}/></div><div className="up-content-two"><div className="up-content-field"><label>Favicon URL</label><input value={form.favicon_url ?? ""} onChange={(e)=>patch({favicon_url:e.target.value || null})} placeholder="https://…"/></div><div className="up-content-field"><label>Social image URL</label><input value={form.social_image_url ?? ""} onChange={(e)=>patch({social_image_url:e.target.value || null})} placeholder="https://…"/></div></div></div></section>
        </div>

        <aside className="up-content-preview"><div className="up-content-preview-bar">{form.announcement_enabled ? (form.announcement_text || "ANNOUNCEMENT") : "WEARO / LIVE PREVIEW"}</div><div className="up-content-preview-body"><small>{form.hero_eyebrow}</small><h2>{form.hero_title}</h2><p>{form.hero_description}</p><a href={form.hero_cta_url}>{form.hero_cta_label}</a><div className="up-content-preview-meta"><strong>{form.social_title}</strong><br/>{form.social_description}</div></div></aside>
      </div>
      <div className="up-content-note"><Image size={11} style={{verticalAlign:"-2px",marginRight:5}}/> Content changes are stored separately from theme colors. Publish them through the same controlled workflow when storefront binding is enabled.</div>
    </div>
  );
}
