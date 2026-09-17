import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DEFAULT_THEME_COLORS,
  type ThemeColors,
  getStoredTheme,
  loadRemoteTheme,
  resetTheme,
  saveThemeToDatabase,
} from "@/lib/theme";
import { loadBranding, uploadLogo } from "@/lib/branding";

export const Route = createFileRoute("/admin/appearance")({
  component: AdminAppearancePage,
  head: () => ({ meta: [{ title: "Appearance — UpThink Admin" }] }),
});

type PreviewDevice = "desktop" | "tablet" | "mobile";
type AppearanceTab = "branding" | "colors" | "typography" | "components" | "content";

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

const TABS: Array<{ id: AppearanceTab; label: string; target: string }> = [
  { id: "branding", label: "Branding", target: "appearance-branding" },
  { id: "colors", label: "Colors", target: "appearance-colors" },
  { id: "typography", label: "Typography", target: "appearance-typography" },
  { id: "components", label: "Components", target: "appearance-components" },
  { id: "content", label: "Content", target: "appearance-content" },
];

function AdminAppearancePage() {
  const [colors, setColors] = useState<ThemeColors>(getStoredTheme());
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [savedColors, setSavedColors] = useState<ThemeColors>(getStoredTheme());
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [activeTab, setActiveTab] = useState<AppearanceTab>("branding");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = JSON.stringify(colors) !== JSON.stringify(savedColors);

  useEffect(() => {
    let active = true;
    void loadRemoteTheme().then((remote) => {
      if (active && remote) {
        setColors(remote);
        setSavedColors(remote);
      }
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

  function jumpTo(tab: AppearanceTab) {
    setActiveTab(tab);
    document.getElementById(TABS.find((item) => item.id === tab)?.target ?? "")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function discardChanges() {
    setColors(savedColors);
    setSaved(false);
    setMessage("Unsaved changes discarded.");
    setError(null);
  }

  async function handleSave() {
    setBusy(true); setSaved(false); setMessage(null); setError(null);
    try {
      const next = await saveThemeToDatabase(colors);
      setColors(next);
      setSavedColors(next);
      setSaved(true);
      setMessage("Theme saved to Supabase.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save theme.");
    } finally { setBusy(false); }
  }

  async function handleReset() {
    if (!window.confirm("Reset the theme to the default UPTHINK 2026 palette? Unsaved changes will be discarded.")) return;
    setBusy(true); setSaved(false); setMessage(null); setError(null);
    try {
      const next = await resetTheme();
      setColors(next);
      setSavedColors(next);
      setSaved(true);
      setMessage("Theme reset to UPTHINK 2026.");
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

  const previewWidth = device === "mobile" ? 390 : device === "tablet" ? 720 : undefined;
  const previewStyle: CSSProperties = {
    ["--theme-background" as string]: colors.background,
    ["--theme-foreground" as string]: colors.foreground,
    ["--theme-accent" as string]: colors.accent,
    ["--theme-surface" as string]: colors.surface,
  } as CSSProperties;

  return (
    <div className="up-theme-page">
      <style>{`
        .up-theme-page { display:grid; gap:18px; min-width:0; }
        .up-theme-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; padding-bottom:2px; }
        .up-theme-kicker { color:#7d7e79; font-size:9px; font-weight:800; letter-spacing:.2em; }
        .up-theme-header h1 { margin:7px 0 5px; font-size:34px; letter-spacing:-.04em; }
        .up-theme-header p { margin:0; color:#777; font-size:13px; }
        .up-theme-status { color:#2C5745; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
        .up-theme-feedback { margin-top:8px; font-size:11px; }
        .up-theme-feedback.success { color:#2C5745; }
        .up-theme-feedback.error { color:#C44B1D; }
        .up-theme-unsaved { display:flex; align-items:center; gap:8px; color:#58738C; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        .up-theme-unsaved-dot { width:7px; height:7px; border-radius:50%; background:#58738C; box-shadow:0 0 0 3px rgba(88,115,140,.12); }
        .up-theme-tabs { position:sticky; top:0; z-index:20; display:flex; gap:4px; overflow-x:auto; padding:5px; background:#f4f3ef; border:1px solid #e1e0da; scrollbar-width:none; }
        .up-theme-tabs::-webkit-scrollbar { display:none; }
        .up-theme-tab { flex:0 0 auto; border:1px solid transparent; background:transparent; padding:9px 13px; color:#777; font-size:9px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
        .up-theme-tab:hover { color:#222; }
        .up-theme-tab.active { background:#1b1a17; color:#fff; border-color:#1b1a17; }
        .up-theme-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(330px,.58fr); gap:16px; align-items:start; }
        .up-theme-main { display:grid; gap:16px; min-width:0; }
        .up-theme-panel { background:#fff; border:1px solid #e3e2dc; padding:20px; scroll-margin-top:74px; }
        .up-theme-panel h2 { margin:0 0 5px; font-size:16px; letter-spacing:-.02em; }
        .up-theme-panel > p { margin:0 0 17px; color:#888; font-size:11px; line-height:1.6; }
        .up-branding-panel { display:grid; grid-template-columns:minmax(170px,.42fr) minmax(0,1fr); gap:18px; align-items:stretch; }
        .up-branding-preview { min-height:130px; border:1px dashed #c9c8c1; background:repeating-conic-gradient(#f5f5f2 0 25%, #fff 0 50%) 50% / 16px 16px; display:grid; place-items:center; padding:18px; }
        .up-branding-preview img { max-width:100%; max-height:90px; object-fit:contain; }
        .up-branding-fallback { font-size:28px; font-weight:900; letter-spacing:.1em; }
        .up-branding-content { display:flex; flex-direction:column; justify-content:center; min-width:0; }
        .up-branding-assets { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }
        .up-branding-slot { min-height:62px; padding:10px; border:1px solid #e7e6df; background:#fafaf8; }
        .up-branding-slot strong { display:block; font-size:9px; letter-spacing:.08em; text-transform:uppercase; }
        .up-branding-slot span { display:block; margin-top:6px; color:#9a9993; font-size:9px; }
        .up-branding-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .up-branding-button { display:inline-flex; align-items:center; justify-content:center; border:1px solid #dddcd5; background:#fff; padding:10px 14px; font-size:9px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-branding-button.primary { background:var(--theme-accent,#EB7D00); border-color:var(--theme-accent,#EB7D00); color:#111; }
        .up-branding-button:disabled { opacity:.55; cursor:wait; }
        .up-branding-meta { margin-top:9px; color:#999; font-size:9px; line-height:1.55; }
        .up-theme-color-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
        .up-theme-color { display:grid; grid-template-columns:50px minmax(0,1fr) auto; align-items:center; gap:11px; padding:10px; border:1px solid #e8e7e1; min-width:0; }
        .up-theme-swatch { width:50px; height:44px; border:1px solid rgba(0,0,0,.1); }
        .up-theme-color strong { display:block; font-size:11px; }
        .up-theme-color small { display:block; margin-top:4px; color:#92928d; font-size:9px; line-height:1.35; }
        .up-theme-color input[type=text] { width:91px; border:1px solid #dddcd5; padding:8px; font:600 10px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; outline:none; }
        .up-theme-color input[type=text]:focus { border-color:#2C5745; }
        .up-theme-color input[type=color] { width:36px; height:36px; padding:2px; border:1px solid #dddcd5; background:#fff; cursor:pointer; }
        .up-theme-preset-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
        .up-theme-preset { display:grid; gap:9px; padding:11px; border:1px solid #e3e2dc; background:#fff; text-align:left; cursor:pointer; }
        .up-theme-preset:hover { border-color:#2C5745; }
        .up-theme-preset-name { font-size:10px; font-weight:800; letter-spacing:.04em; }
        .up-theme-preset-colors { display:flex; gap:3px; }
        .up-theme-preset-colors span { flex:1; height:18px; border:1px solid rgba(0,0,0,.08); }
        .up-theme-preview-panel { position:sticky; top:58px; min-width:0; }
        .up-theme-preview-toolbar { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:9px; }
        .up-theme-preview-toolbar strong { font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
        .up-theme-device-switcher { display:flex; gap:3px; padding:3px; border:1px solid #e3e2dc; background:#f7f6f2; }
        .up-theme-device { border:0; background:transparent; padding:6px 8px; color:#888; font-size:8px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; }
        .up-theme-device.active { background:#1b1a17; color:#fff; }
        .up-theme-preview-shell { display:flex; justify-content:center; width:100%; min-height:420px; padding:12px; background:#e9e8e2; border:1px solid #deddd7; overflow:hidden; }
        .up-theme-preview { width:100%; min-height:396px; padding:20px; background:var(--theme-background,#2E2910); color:var(--theme-foreground,#EBE3A7); position:relative; overflow:hidden; transition:width .2s ease; }
        .up-theme-preview::after { content:"LIVE PREVIEW"; position:absolute; right:13px; top:12px; font-size:7px; letter-spacing:.16em; opacity:.55; }
        .up-theme-preview-nav { display:flex; align-items:center; justify-content:space-between; gap:10px; padding-bottom:15px; border-bottom:1px solid color-mix(in oklab,var(--theme-foreground) 20%,transparent); font-size:8px; letter-spacing:.1em; }
        .up-theme-preview-brand { font-weight:900; letter-spacing:.14em; display:flex; align-items:center; gap:7px; }
        .up-theme-preview-mark { display:inline-grid; place-items:center; width:24px; height:24px; background:var(--theme-accent); color:var(--theme-surface); overflow:hidden; flex:0 0 auto; }
        .up-theme-preview-mark img { width:100%; height:100%; object-fit:contain; }
        .up-theme-preview-content { padding:40px 0 18px; }
        .up-theme-preview-content small { color:var(--theme-accent); font-size:7px; letter-spacing:.16em; }
        .up-theme-preview-content h3 { margin:9px 0 17px; max-width:420px; font-size:clamp(30px,5vw,55px); line-height:.9; letter-spacing:-.05em; text-transform:uppercase; }
        .up-theme-preview-content button { border:0; padding:10px 13px; background:var(--theme-accent); color:var(--theme-surface); font-size:8px; font-weight:900; letter-spacing:.08em; }
        .up-theme-preview-components { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:20px; }
        .up-theme-preview-card { padding:11px; background:color-mix(in oklab,var(--theme-surface) 72%,transparent); border:1px solid color-mix(in oklab,var(--theme-foreground) 12%,transparent); }
        .up-theme-preview-card small { color:var(--theme-foreground); opacity:.6; font-size:7px; letter-spacing:.1em; }
        .up-theme-preview-input { margin-top:8px; padding:8px; border:1px solid color-mix(in oklab,var(--theme-foreground) 22%,transparent); font-size:8px; opacity:.8; }
        .up-theme-actions { display:flex; justify-content:flex-end; gap:7px; margin-top:9px; }
        .up-theme-actions button { border:1px solid #dddcd5; background:#fff; padding:10px 13px; font-size:9px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-theme-actions .primary { background:var(--theme-accent,#EB7D00); border-color:var(--theme-accent,#EB7D00); color:var(--theme-background,#0B0909); }
        .up-theme-actions button:disabled { opacity:.55; cursor:wait; }
        .up-theme-placeholder { display:grid; place-items:center; min-height:115px; border:1px dashed #d3d2cb; background:#fafaf8; color:#999; font-size:9px; letter-spacing:.1em; text-transform:uppercase; }
        .up-theme-sticky-bar { position:sticky; bottom:10px; z-index:25; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:9px 10px; background:#1b1a17; color:#fff; box-shadow:0 8px 30px rgba(0,0,0,.12); }
        .up-theme-sticky-copy { display:flex; align-items:center; gap:8px; min-width:0; }
        .up-theme-sticky-copy strong { font-size:9px; letter-spacing:.1em; text-transform:uppercase; }
        .up-theme-sticky-copy span { color:#aaa; font-size:9px; }
        .up-theme-sticky-actions { display:flex; gap:6px; flex:0 0 auto; }
        .up-theme-sticky-actions button { border:1px solid #44413a; background:transparent; color:#fff; padding:8px 10px; font-size:8px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-theme-sticky-actions .primary { background:var(--theme-accent,#EB7D00); border-color:var(--theme-accent,#EB7D00); color:#111; }
        @media (max-width:1050px) { .up-theme-layout { grid-template-columns:1fr; } .up-theme-preview-panel { position:relative; top:auto; } }
        @media (max-width:800px) { .up-branding-panel { grid-template-columns:1fr; } .up-theme-color-grid { grid-template-columns:1fr; } .up-theme-preset-grid { grid-template-columns:1fr; } .up-branding-assets { grid-template-columns:1fr; } }
        @media (max-width:600px) { .up-theme-header { display:block; } .up-theme-status { margin-top:10px; } .up-theme-panel { padding:15px; } .up-theme-color { grid-template-columns:42px minmax(0,1fr); } .up-theme-swatch { width:42px; height:42px; } .up-theme-color input[type=text] { grid-column:2; width:100%; } .up-theme-color input[type=color] { position:absolute; opacity:0; pointer-events:none; } .up-theme-sticky-bar { align-items:flex-start; flex-direction:column; } .up-theme-sticky-actions { width:100%; } .up-theme-sticky-actions button { flex:1; } }
      `}</style>

      <header className="up-theme-header">
        <div>
          <div className="up-theme-kicker">ADMIN / APPEARANCE / BRANDING</div>
          <h1>Appearance System</h1>
          <p>Control the visual identity and design system from one workspace.</p>
          {message && <div className="up-theme-feedback success">✓ {message}</div>}
          {error && <div className="up-theme-feedback error">⚠ {error}</div>}
        </div>
        <div>
          {hasUnsavedChanges ? (
            <div className="up-theme-unsaved"><span className="up-theme-unsaved-dot" /> Unsaved changes</div>
          ) : saved ? <div className="up-theme-status">✓ Theme saved</div> : null}
        </div>
      </header>

      <nav className="up-theme-tabs" aria-label="Appearance sections">
        {TABS.map((tab) => (
          <button key={tab.id} type="button" className={`up-theme-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => jumpTo(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="up-theme-layout">
        <main className="up-theme-main">
          <section id="appearance-branding" className="up-theme-panel">
            <h2>Brand assets</h2>
            <p>Keep the active brand mark compact while reserving space for the next asset controls.</p>
            <div className="up-branding-panel">
              <div className="up-branding-preview">
                {logoUrl ? <img src={logoUrl} alt="Current site logo" /> : <span className="up-branding-fallback">UPTHINK.</span>}
              </div>
              <div className="up-branding-content">
                <div className="up-branding-actions">
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={(event) => void handleLogoChange(event.target.files?.[0])} />
                  <button type="button" className="up-branding-button primary" disabled={logoBusy} onClick={() => fileInputRef.current?.click()}>
                    {logoBusy ? "UPLOADING…" : "CHANGE LOGO"}
                  </button>
                </div>
                <div className="up-branding-meta">PNG · JPEG · SVG · WebP · maximum 2 MB. Active logo remains stored through the existing Supabase branding flow.</div>
                <div className="up-branding-assets" aria-label="Reserved brand asset slots">
                  <div className="up-branding-slot"><strong>Dark logo</strong><span>Reserved</span></div>
                  <div className="up-branding-slot"><strong>Monogram</strong><span>Reserved</span></div>
                  <div className="up-branding-slot"><strong>Favicon</strong><span>Reserved</span></div>
                </div>
              </div>
            </div>
          </section>

          <section id="appearance-colors" className="up-theme-panel">
            <h2>Global palette</h2>
            <p>Edit semantic colors in a compact two-column grid. The preview updates immediately without writing to Supabase.</p>
            <div className="up-theme-color-grid">
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

          <section id="appearance-presets" className="up-theme-panel">
            <h2>Palette library</h2>
            <p>Apply a preset to the local draft. Nothing is published until the existing save action is used.</p>
            <div className="up-theme-preset-grid">
              {PRESETS.map((preset) => (
                <button className="up-theme-preset" type="button" key={preset.name} disabled={busy} onClick={() => { setColors(preset.colors); setSaved(false); setMessage(null); setError(null); }}>
                  <span className="up-theme-preset-name">{preset.name}</span>
                  <span className="up-theme-preset-colors">{Object.values(preset.colors).map((color) => <span key={color} style={{ background: color }} />)}</span>
                </button>
              ))}
            </div>
          </section>

          <section id="appearance-typography" className="up-theme-panel">
            <h2>Typography</h2>
            <p>The configuration surface is prepared without changing the project's existing font system.</p>
            <div className="up-theme-placeholder">Typography controls — next design-system phase</div>
          </section>

          <section id="appearance-components" className="up-theme-panel">
            <h2>Components</h2>
            <p>Component-level tokens will be exposed here after the global palette is stabilized.</p>
            <div className="up-theme-placeholder">Component controls — next design-system phase</div>
          </section>

          <section id="appearance-content" className="up-theme-panel">
            <h2>Content</h2>
            <p>Announcement, hero and social branding controls are intentionally reserved for the next phase.</p>
            <div className="up-theme-placeholder">Content controls — next branding phase</div>
          </section>
        </main>

        <aside className="up-theme-preview-panel">
          <div className="up-theme-preview-toolbar">
            <strong>Live preview</strong>
            <div className="up-theme-device-switcher" aria-label="Preview device">
              {(["desktop", "tablet", "mobile"] as PreviewDevice[]).map((item) => (
                <button key={item} type="button" className={`up-theme-device ${device === item ? "active" : ""}`} onClick={() => setDevice(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="up-theme-preview-shell">
            <div className="up-theme-preview" style={{ ...previewStyle, ...(previewWidth ? { width: `${previewWidth}px`, maxWidth: "100%" } : {}) }}>
              <div className="up-theme-preview-nav">
                <span className="up-theme-preview-brand">
                  <span className="up-theme-preview-mark">{logoUrl ? <img src={logoUrl} alt="" /> : "U"}</span>
                  UPTHINK.
                </span>
                <span>SHOP / AI / ACCOUNT</span>
              </div>
              <div className="up-theme-preview-content">
                <small>FASHION SYSTEM / 2026</small>
                <h3>Your style.<br />Your identity.</h3>
                <button type="button">EXPLORE COLLECTION →</button>
                <div className="up-theme-preview-components">
                  <div className="up-theme-preview-card"><small>PRODUCT CARD</small><div className="up-theme-preview-input">NIGHT SHIFT / 899.000₫</div></div>
                  <div className="up-theme-preview-card"><small>SEARCH</small><div className="up-theme-preview-input">Search products…</div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="up-theme-actions">
            <button type="button" disabled={busy || !hasUnsavedChanges} onClick={discardChanges}>DISCARD</button>
            <button type="button" disabled={busy} onClick={() => void handleReset}>{busy ? "SAVING…" : "RESET"}</button>
            <button type="button" className="primary" disabled={busy || !hasUnsavedChanges} onClick={() => void handleSave}>{busy ? "SAVING…" : "SAVE THEME"}</button>
          </div>
        </aside>
      </div>

      {hasUnsavedChanges && (
        <div className="up-theme-sticky-bar">
          <div className="up-theme-sticky-copy"><span className="up-theme-unsaved-dot" /><strong>Unsaved theme changes</strong><span>Preview only until saved.</span></div>
          <div className="up-theme-sticky-actions">
            <button type="button" onClick={discardChanges}>DISCARD</button>
            <button type="button" className="primary" disabled={busy} onClick={() => void handleSave}>{busy ? "SAVING…" : "SAVE THEME"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
