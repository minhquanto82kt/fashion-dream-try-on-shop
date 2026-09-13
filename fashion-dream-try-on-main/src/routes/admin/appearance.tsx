import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_THEME_COLORS,
  type ThemeColors,
  getStoredTheme,
  loadRemoteTheme,
  resetTheme,
  saveThemeToDatabase,
} from "@/lib/theme";
import { loadBranding, MAX_LOGO_SIZE, SUPPORTED_LOGO_TYPES, uploadLogo } from "@/lib/branding";

export const Route = createFileRoute("/admin/appearance")({
  component: AdminAppearancePage,
  head: () => ({ meta: [{ title: "Appearance — UpThink Admin" }] }),
});

const COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string; description: string }> = [
  { key: "primary", label: "Primary", description: "Main brand surfaces and navigation" },
  { key: "secondary", label: "Secondary", description: "Supporting surfaces and controls" },
  { key: "background", label: "Background", description: "Main page background" },
  { key: "surface", label: "Surface", description: "Cards, panels and deep surfaces" },
  { key: "accent", label: "Accent", description: "CTA, active states and highlights" },
  { key: "foreground", label: "Foreground", description: "Primary text on dark surfaces" },
];

const PRESETS: Array<{ name: string; colors: ThemeColors }> = [
  { name: "UPTHINK 2026", colors: DEFAULT_THEME_COLORS },
  { name: "Midnight Editorial", colors: { primary: "#161616", secondary: "#30302B", background: "#161616", surface: "#0B0909", accent: "#EB7D00", foreground: "#EBE3A7" } },
  { name: "Forest Studio", colors: { primary: "#17352C", secondary: "#2C5745", background: "#17352C", surface: "#0B0909", accent: "#EBE3A7", foreground: "#F4F0D2" } },
];

function AdminAppearancePage() {
  const [colors, setColors] = useState<ThemeColors>(getStoredTheme());
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void loadRemoteTheme().then((remote) => {
      if (active && remote) setColors(remote);
    });
    void loadBranding().then((branding) => {
      if (active) setLogoUrl(branding.logoUrl);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onBrandingChanged = (event: Event) => {
      const branding = (event as CustomEvent<{ logoUrl: string | null }>).detail;
      setLogoUrl(branding.logoUrl);
    };
    window.addEventListener("upthink:branding:changed", onBrandingChanged);
    return () => window.removeEventListener("upthink:branding:changed", onBrandingChanged);
  }, []);

  function updateColor(key: keyof ThemeColors, value: string) {
    setSaved(false);
    setMessage(null);
    setError(null);
    setColors((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setBusy(true); setSaved(false); setMessage(null); setError(null);
    try {
      const next = await saveThemeToDatabase(colors);
      setColors(next); setSaved(true); setMessage("Theme saved to Supabase.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save theme.");
    } finally { setBusy(false); }
  }

  async function handleReset() {
    setBusy(true); setSaved(false); setMessage(null); setError(null);
    try {
      const next = await resetTheme();
      setColors(next); setSaved(true); setMessage("Theme reset to UPTHINK 2026.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reset theme.");
    } finally { setBusy(false); }
  }

  async function handleLogoChange(file: File | undefined) {
    if (!file) return;
    setLogoBusy(true); setMessage(null); setError(null);
    try {
      const branding = await uploadLogo(file);
      setLogoUrl(branding.logoUrl);
      setMessage("Logo updated. It is now live across the public website.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to upload logo.");
    } finally {
      setLogoBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="up-theme-page">
      <style>{`
        .up-theme-page { display:grid; gap:24px; }
        .up-theme-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; }
        .up-theme-kicker { color:#7d7e79; font-size:9px; font-weight:800; letter-spacing:.2em; }
        .up-theme-header h1 { margin:7px 0 5px; font-size:34px; letter-spacing:-.04em; }
        .up-theme-header p { margin:0; color:#777; font-size:13px; }
        .up-theme-status { color:var(--theme-secondary,#2C5745); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .up-theme-feedback { margin-top:8px; font-size:11px; }
        .up-theme-feedback.success { color:var(--theme-secondary,#2C5745); }
        .up-theme-feedback.error { color:var(--theme-accent,#EB7D00); }
        .up-theme-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,.75fr); gap:16px; }
        .up-theme-panel { background:#fff; border:1px solid #e3e2dc; padding:24px; }
        .up-theme-panel h2 { margin:0 0 5px; font-size:17px; letter-spacing:-.02em; }
        .up-theme-panel > p { margin:0 0 20px; color:#888; font-size:11px; line-height:1.6; }
        .up-theme-colors,.up-theme-presets { display:grid; gap:10px; }
        .up-theme-color { display:grid; grid-template-columns:58px 1fr auto; align-items:center; gap:14px; padding:12px; border:1px solid #e8e7e1; }
        .up-theme-swatch { width:58px; height:42px; border:1px solid rgba(0,0,0,.1); }
        .up-theme-color strong { display:block; font-size:12px; }
        .up-theme-color small { display:block; margin-top:4px; color:#92928d; font-size:10px; }
        .up-theme-color input[type=text] { width:105px; border:1px solid #dddcd5; padding:9px 10px; font:600 11px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; outline:none; }
        .up-theme-color input[type=text]:focus { border-color:var(--theme-secondary,#2C5745); }
        .up-theme-color input[type=color] { width:42px; height:42px; padding:2px; border:1px solid #dddcd5; background:#fff; cursor:pointer; }
        .up-theme-preset { display:grid; grid-template-columns:1fr auto; align-items:center; gap:12px; padding:13px; border:1px solid #e3e2dc; background:#fff; text-align:left; cursor:pointer; }
        .up-theme-preset:hover { border-color:var(--theme-secondary,#2C5745); }
        .up-theme-preset-name { font-size:11px; font-weight:800; letter-spacing:.04em; }
        .up-theme-preset-colors { display:flex; gap:3px; }
        .up-theme-preset-colors span { width:18px; height:18px; border:1px solid rgba(0,0,0,.08); }
        .up-theme-preview { margin-top:20px; min-height:260px; padding:22px; background:var(--theme-background,#2E2910); color:var(--theme-foreground,#EBE3A7); position:relative; overflow:hidden; }
        .up-theme-preview::after { content:"LIVE PREVIEW"; position:absolute; right:14px; top:14px; font-size:8px; letter-spacing:.16em; opacity:.55; }
        .up-theme-preview-nav { display:flex; align-items:center; justify-content:space-between; padding-bottom:18px; border-bottom:1px solid color-mix(in oklab,var(--theme-foreground) 20%,transparent); font-size:9px; letter-spacing:.12em; }
        .up-theme-preview-brand { font-weight:900; letter-spacing:.14em; display:flex; align-items:center; gap:8px; }
        .up-theme-preview-mark { display:inline-grid; place-items:center; width:25px; height:25px; margin-right:0; background:var(--theme-accent); color:var(--theme-surface); overflow:hidden; }
        .up-theme-preview-mark img { width:100%; height:100%; object-fit:contain; }
        .up-theme-preview-content { padding:42px 0 20px; }
        .up-theme-preview-content small { color:var(--theme-accent); font-size:8px; letter-spacing:.18em; }
        .up-theme-preview-content h3 { margin:10px 0 18px; max-width:420px; font-size:clamp(32px,5vw,58px); line-height:.9; letter-spacing:-.05em; text-transform:uppercase; }
        .up-theme-preview-content button { border:0; padding:11px 15px; background:var(--theme-accent); color:var(--theme-surface); font-size:9px; font-weight:900; letter-spacing:.08em; }
        .up-theme-actions { display:flex; justify-content:flex-end; gap:9px; margin-top:20px; }
        .up-theme-actions button { border:1px solid #dddcd5; background:#fff; padding:12px 16px; font-size:10px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-theme-actions .primary { background:var(--theme-accent,#EB7D00); border-color:var(--theme-accent,#EB7D00); color:var(--theme-background,#0B0909); }
        .up-theme-actions button:disabled { opacity:.55; cursor:wait; }
        .up-branding-panel { margin-bottom:16px; background:#fff; border:1px solid #e3e2dc; padding:24px; }
        .up-branding-grid { display:grid; grid-template-columns:180px 1fr; gap:22px; align-items:center; }
        .up-branding-preview { min-height:120px; border:1px dashed #c9c8c1; background:repeating-conic-gradient(#f5f5f2 0 25%, #fff 0 50%) 50% / 16px 16px; display:grid; place-items:center; padding:18px; }
        .up-branding-preview img { max-width:100%; max-height:92px; object-fit:contain; }
        .up-branding-fallback { font-size:30px; font-weight:900; letter-spacing:.1em; }
        .up-branding-actions { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
        .up-branding-button { display:inline-flex; align-items:center; justify-content:center; border:1px solid #dddcd5; background:#fff; padding:12px 16px; font-size:10px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-branding-button.primary { background:var(--theme-accent,#EB7D00); border-color:var(--theme-accent,#EB7D00); color:#111; }
        .up-branding-button:disabled { opacity:.55; cursor:wait; }
        .up-branding-meta { margin-top:10px; color:#999; font-size:10px; line-height:1.6; }
        @media (max-width:900px) { .up-theme-grid { grid-template-columns:1fr; } .up-branding-grid { grid-template-columns:1fr; } }
        @media (max-width:600px) { .up-theme-header { display:block; } .up-theme-color { grid-template-columns:42px 1fr; } .up-theme-swatch { width:42px; height:42px; } .up-theme-color input[type=text] { grid-column:2; width:100%; } .up-theme-color input[type=color] { position:absolute; opacity:0; pointer-events:none; } }
      `}</style>

      <header className="up-theme-header">
        <div>
          <div className="up-theme-kicker">ADMIN / APPEARANCE / BRANDING</div>
          <h1>Appearance</h1>
          <p>Control the website logo and global visual system from Admin.</p>
          {message && <div className="up-theme-feedback success">✓ {message}</div>}
          {error && <div className="up-theme-feedback error">⚠ {error}</div>}
        </div>
        {saved && <div className="up-theme-status">✓ Theme saved</div>}
      </header>

      <section className="up-branding-panel">
        <h2>Site logo</h2>
        <p>Upload the active brand logo. The same logo is used by the public navigation and footer.</p>
        <div className="up-branding-grid">
          <div className="up-branding-preview">
            {logoUrl ? <img src={logoUrl} alt="Current site logo" /> : <span className="up-branding-fallback">UPTHINK.</span>}
          </div>
          <div>
            <div className="up-branding-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                hidden
                onChange={(event) => void handleLogoChange(event.target.files?.[0])}
              />
              <button type="button" className="up-branding-button primary" disabled={logoBusy} onClick={() => fileInputRef.current?.click()}>
                {logoBusy ? "UPLOADING…" : "CHANGE LOGO"}
              </button>
            </div>
            <div className="up-branding-meta">
              Supported: PNG · JPEG · SVG · WebP · maximum 2 MB.<br />
              Logo is stored in Supabase Storage and the active URL is stored in the database. Admin authorization is enforced by RLS.
            </div>
          </div>
        </div>
      </section>

      <div className="up-theme-grid">
        <section className="up-theme-panel">
          <h2>Global palette</h2>
          <p>Changes are applied through semantic CSS variables. No component-specific color is edited here.</p>
          <div className="up-theme-colors">
            {COLOR_FIELDS.map(({ key, label, description }) => (
              <label className="up-theme-color" key={key}>
                <span className="up-theme-swatch" style={{ background: colors[key] }} />
                <span><strong>{label}</strong><small>{description}</small></span>
                <input type="color" value={colors[key]} onChange={(event) => updateColor(key, event.target.value.toUpperCase())} aria-label={`${label} color picker`} />
                <input type="text" value={colors[key]} maxLength={7} onChange={(event) => updateColor(key, event.target.value.toUpperCase())} aria-label={`${label} HEX value`} />
              </label>
            ))}
          </div>
        </section>

        <section className="up-theme-panel">
          <h2>Palette library</h2>
          <p>Preset palettes are kept inside the project.</p>
          <div className="up-theme-presets">
            {PRESETS.map((preset) => (
              <button className="up-theme-preset" key={preset.name} disabled={busy} onClick={() => { setColors(preset.colors); setSaved(false); setMessage(null); setError(null); }}>
                <span className="up-theme-preset-name">{preset.name}</span>
                <span className="up-theme-preset-colors">{Object.values(preset.colors).map((color) => <span key={color} style={{ background: color }} />)}</span>
              </button>
            ))}
          </div>

          <div className="up-theme-preview" style={{
            ["--theme-background" as string]: colors.background,
            ["--theme-foreground" as string]: colors.foreground,
            ["--theme-accent" as string]: colors.accent,
            ["--theme-surface" as string]: colors.surface,
          } as React.CSSProperties}>
            <div className="up-theme-preview-nav">
              <span className="up-theme-preview-brand">
                <span className="up-theme-preview-mark">{logoUrl ? <img src={logoUrl} alt="" /> : "U"}</span>
                UPTHINK.
              </span>
              <span>SHOP / AI / ACCOUNT</span>
            </div>
            <div className="up-theme-preview-content"><small>FASHION SYSTEM / 2026</small><h3>Your style.<br />Your identity.</h3><button>EXPLORE COLLECTION →</button></div>
          </div>

          <div className="up-theme-actions">
            <button disabled={busy} onClick={() => void handleReset()}>{busy ? "SAVING…" : "RESET"}</button>
            <button className="primary" disabled={busy} onClick={() => void handleSave()}>{busy ? "SAVING…" : "SAVE THEME"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}
