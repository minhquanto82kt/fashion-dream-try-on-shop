import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type RefObject } from "react";
import { loadAppearanceContent, saveAppearanceContent, uploadAppearanceAsset, type AppearanceContent } from "@/lib/appearance-content";

export const Route = createFileRoute("/admin/appearance/content")({
  component: AppearanceContentPage,
  head: () => ({ meta: [{ title: "Appearance Content — UpThink Admin" }] }),
});

function AppearanceContentPage() {
  const [content, setContent] = useState<AppearanceContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const darkLogoInput = useRef<HTMLInputElement>(null);
  const monogramInput = useRef<HTMLInputElement>(null);
  const socialInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadAppearanceContent().then(setContent).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load appearance content."));
  }, []);

  function update<K extends keyof AppearanceContent>(key: K, value: AppearanceContent[K]) {
    setContent((current) => current ? { ...current, [key]: value } : current);
    setMessage(null); setError(null);
  }

  async function save() {
    if (!content) return;
    setSaving(true); setMessage(null); setError(null);
    try {
      const next = await saveAppearanceContent({
        dark_logo_url: content.dark_logo_url,
        monogram_url: content.monogram_url,
        social_image_url: content.social_image_url,
        announcement_enabled: content.announcement_enabled,
        announcement_text: content.announcement_text,
        hero_eyebrow: content.hero_eyebrow,
        hero_title: content.hero_title,
        hero_description: content.hero_description,
        hero_primary_cta: content.hero_primary_cta,
        hero_secondary_cta: content.hero_secondary_cta,
      });
      setContent(next); setMessage("Appearance content saved to Supabase.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save appearance content."); }
    finally { setSaving(false); }
  }

  async function upload(file: File | undefined, type: "dark-logo" | "monogram" | "social-preview", key: "dark_logo_url" | "monogram_url" | "social_image_url") {
    if (!file) return;
    setUploading(type); setMessage(null); setError(null);
    try { update(key, await uploadAppearanceAsset(file, type)); setMessage(`${type} uploaded.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Asset upload failed."); }
    finally { setUploading(null); }
  }

  if (!content) return <div style={{ padding: 24 }}>{error ?? "Loading appearance content…"}</div>;

  const assets: Array<[string, keyof AppearanceContent, "dark-logo" | "monogram" | "social-preview", RefObject<HTMLInputElement>]> = [
    ["Dark Logo", "dark_logo_url", "dark-logo", darkLogoInput],
    ["Monogram", "monogram_url", "monogram", monogramInput],
    ["Social Preview", "social_image_url", "social-preview", socialInput],
  ];

  return <div style={{ display: "grid", gap: 18, maxWidth: 980 }}>
    <header><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".2em", color: "#777" }}>APPEARANCE / BRAND & COMMERCE</div><h1 style={{ margin: "7px 0 5px", fontSize: 34 }}>Content</h1><p style={{ margin: 0, color: "#777", fontSize: 13 }}>Quản lý asset thương hiệu, social preview, announcement bar và hero content từ một nơi.</p></header>
    {(message || error) && <div style={{ padding: 11, border: "1px solid #e3e2dc", background: "#fff", color: error ? "#c44b1d" : "#2c5745", fontSize: 11 }}>{error ?? `✓ ${message}`}</div>}
    <section style={{ background: "#fff", border: "1px solid #e3e2dc", padding: 20 }}>
      <h2 style={{ margin: "0 0 5px", fontSize: 17 }}>Brand Assets</h2><p style={{ margin: "0 0 16px", color: "#888", fontSize: 11 }}>Dark Logo, Monogram và Social Preview Image được lưu trong Supabase Storage.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {assets.map(([label, key, type, ref]) => <div key={label} style={{ border: "1px dashed #ccc", padding: 14, minHeight: 120, display: "grid", gap: 10 }}><strong style={{ fontSize: 11 }}>{label}</strong>{content[key] && <img src={content[key] as string} alt={label} style={{ maxWidth: "100%", maxHeight: 70, objectFit: "contain" }} />}<button type="button" onClick={() => ref.current?.click()} disabled={uploading === type}>{uploading === type ? "Uploading…" : "Upload"}</button><input ref={ref} hidden type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => void upload(e.target.files?.[0], type, key)} /></div>)}
      </div>
    </section>
    <section style={{ background: "#fff", border: "1px solid #e3e2dc", padding: 20 }}>
      <h2 style={{ margin: "0 0 5px", fontSize: 17 }}>Announcement Bar</h2><p style={{ margin: "0 0 16px", color: "#888", fontSize: 11 }}>Nội dung hiển thị ở lớp announcement của storefront.</p>
      <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 11, fontWeight: 800, marginBottom: 12 }}><input type="checkbox" checked={content.announcement_enabled} onChange={(e) => update("announcement_enabled", e.target.checked)} /> Enabled</label>
      <input style={{ width: "100%", boxSizing: "border-box", padding: 11, border: "1px solid #ddd" }} value={content.announcement_text} onChange={(e) => update("announcement_text", e.target.value)} maxLength={160} />
    </section>
    <section style={{ background: "#fff", border: "1px solid #e3e2dc", padding: 20 }}>
      <h2 style={{ margin: "0 0 5px", fontSize: 17 }}>Hero Content</h2><p style={{ margin: "0 0 16px", color: "#888", fontSize: 11 }}>Copy điều khiển trực tiếp hero: eyebrow, title, description và CTA.</p>
      <div style={{ display: "grid", gap: 11 }}>
        {([["hero_eyebrow", "Eyebrow"], ["hero_title", "Title"], ["hero_primary_cta", "Primary CTA"], ["hero_secondary_cta", "Secondary CTA"]] as const).map(([key, label]) => <label key={key} style={{ display: "grid", gap: 6, fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>{label}<input style={{ padding: 11, border: "1px solid #ddd", fontSize: 13 }} value={content[key]} onChange={(e) => update(key, e.target.value)} maxLength={180} /></label>)}
        <label style={{ display: "grid", gap: 6, fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Description<textarea style={{ minHeight: 90, padding: 11, border: "1px solid #ddd", font: "inherit" }} value={content.hero_description} onChange={(e) => update("hero_description", e.target.value)} maxLength={400} /></label>
      </div>
    </section>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><button type="button" onClick={() => void save()} disabled={saving} style={{ background: "#1b1a17", color: "#fff", border: 0, padding: "11px 16px", fontWeight: 800 }}>{saving ? "Saving…" : "Save Content"}</button></div>
  </div>;
}
