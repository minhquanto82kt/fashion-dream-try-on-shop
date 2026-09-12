import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DEFAULT_THEME_COLORS,
  type ThemeColors,
  resetTheme,
  saveTheme,
} from "@/lib/theme";

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
  {
    name: "Midnight Editorial",
    colors: {
      primary: "#161616",
      secondary: "#30302B",
      background: "#161616",
      surface: "#0B0909",
      accent: "#EB7D00",
      foreground: "#EBE3A7",
    },
  },
  {
    name: "Forest Studio",
    colors: {
      primary: "#17352C",
      secondary: "#2C5745",
      background: "#17352C",
      surface: "#0B0909",
      accent: "#EBE3A7",
      foreground: "#F4F0D2",
    },
  },
];

function AdminAppearancePage() {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME_COLORS);
  const [saved, setSaved] = useState(false);

  function updateColor(key: keyof ThemeColors, value: string) {
    setSaved(false);
    setColors((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    saveTheme(colors);
    setSaved(true);
  }

  function handleReset() {
    setColors(resetTheme());
    setSaved(true);
  }

  return (
    <div className="up-theme-page">
      <style>{`
        .up-theme-page { display: grid; gap: 24px; }
        .up-theme-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; }
        .up-theme-kicker { color:#7d7e79; font-size:9px; font-weight:800; letter-spacing:.2em; }
        .up-theme-header h1 { margin:7px 0 5px; font-size:34px; letter-spacing:-.04em; }
        .up-theme-header p { margin:0; color:#777; font-size:13px; }
        .up-theme-status { color:#2C5745; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .up-theme-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,.75fr); gap:16px; }
        .up-theme-panel { background:#fff; border:1px solid #e3e2dc; padding:24px; }
        .up-theme-panel h2 { margin:0 0 5px; font-size:17px; letter-spacing:-.02em; }
        .up-theme-panel > p { margin:0 0 20px; color:#888; font-size:11px; line-height:1.6; }
        .up-theme-colors { display:grid; gap:10px; }
        .up-theme-color { display:grid; grid-template-columns:58px 1fr auto; align-items:center; gap:14px; padding:12px; border:1px solid #e8e7e1; }
        .up-theme-swatch { width:58px; height:42px; border:1px solid rgba(0,0,0,.1); }
        .up-theme-color strong { display:block; font-size:12px; }
        .up-theme-color small { display:block; margin-top:4px; color:#92928d; font-size:10px; }
        .up-theme-color input[type=text] { width:105px; border:1px solid #dddcd5; padding:9px 10px; font:600 11px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; outline:none; }
        .up-theme-color input[type=text]:focus { border-color:#2C5745; }
        .up-theme-color input[type=color] { width:42px; height:42px; padding:2px; border:1px solid #dddcd5; background:#fff; cursor:pointer; }
        .up-theme-presets { display:grid; gap:10px; }
        .up-theme-preset { display:grid; grid-template-columns:1fr auto; align-items:center; gap:12px; padding:13px; border:1px solid #e3e2dc; background:#fff; text-align:left; cursor:pointer; }
        .up-theme-preset:hover { border-color:#2C5745; }
        .up-theme-preset-name { font-size:11px; font-weight:800; letter-spacing:.04em; }
        .up-theme-preset-colors { display:flex; gap:3px; }
        .up-theme-preset-colors span { width:18px; height:18px; border:1px solid rgba(0,0,0,.08); }
        .up-theme-preview { margin-top:20px; min-height:260px; padding:22px; background:var(--theme-background,#2E2910); color:var(--theme-foreground,#EBE3A7); position:relative; overflow:hidden; }
        .up-theme-preview::after { content:"LIVE PREVIEW"; position:absolute; right:14px; top:14px; font-size:8px; letter-spacing:.16em; opacity:.55; }
        .up-theme-preview-nav { display:flex; align-items:center; justify-content:space-between; padding-bottom:18px; border-bottom:1px solid color-mix(in oklab,var(--theme-foreground) 20%,transparent); font-size:9px; letter-spacing:.12em; }
        .up-theme-preview-brand { font-weight:900; letter-spacing:.14em; }
        .up-theme-preview-mark { display:inline-grid; place-items:center; width:25px; height:25px; margin-right:8px; background:var(--theme-accent); color:var(--theme-surface); }
        .up-theme-preview-content { padding:42px 0 20px; }
        .up-theme-preview-content small { color:var(--theme-accent); font-size:8px; letter-spacing:.18em; }
        .up-theme-preview-content h3 { margin:10px 0 18px; max-width:420px; font-size:clamp(32px,5vw,58px); line-height:.9; letter-spacing:-.05em; text-transform:uppercase; }
        .up-theme-preview-content button { border:0; padding:11px 15px; background:var(--theme-accent); color:var(--theme-surface); font-size:9px; font-weight:900; letter-spacing:.08em; }
        .up-theme-actions { display:flex; justify-content:flex-end; gap:9px; margin-top:20px; }
        .up-theme-actions button { border:1px solid #dddcd5; background:#fff; padding:12px 16px; font-size:10px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-theme-actions .primary { background:#EB7D00; border-color:#EB7D00; color:#0B0909; }
        @media (max-width:900px) { .up-theme-grid { grid-template-columns:1fr; } }
        @media (max-width:600px) { .up-theme-header { display:block; } .up-theme-color { grid-template-columns:42px 1fr; } .up-theme-swatch { width:42px; height:42px; } .up-theme-color input[type=text] { grid-column:2; width:100%; } .up-theme-color input[type=color] { position:absolute; opacity:0; pointer-events:none; } }
      `}</style>

      <header className="up-theme-header">
        <div>
          <div className="up-theme-kicker">ADMIN / APPEARANCE / COLOR</div>
          <h1>Color System</h1>
          <p>Control the website palette from Admin without editing CSS files.</p>
        </div>
        {saved && <div className="up-theme-status">✓ Theme saved</div>}
      </header>

      <div className="up-theme-grid">
        <section className="up-theme-panel">
          <h2>Global palette</h2>
          <p>Changes are applied through semantic CSS variables. No component-specific color is edited here.</p>
          <div className="up-theme-colors">
            {COLOR_FIELDS.map(({ key, label, description }) => (
              <label className="up-theme-color" key={key}>
                <span className="up-theme-swatch" style={{ background: colors[key] }} />
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(event) => updateColor(key, event.target.value.toUpperCase())}
                  aria-label={`${label} color picker`}
                />
                <input
                  type="text"
                  value={colors[key]}
                  maxLength={7}
                  onChange={(event) => updateColor(key, event.target.value.toUpperCase())}
                  aria-label={`${label} HEX value`}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="up-theme-panel">
          <h2>Palette library</h2>
          <p>Preset palettes are kept inside the project. Color Hunt can be added later as an import source without coupling the theme engine to it.</p>
          <div className="up-theme-presets">
            {PRESETS.map((preset) => (
              <button className="up-theme-preset" key={preset.name} onClick={() => { setColors(preset.colors); setSaved(false); }}>
                <span className="up-theme-preset-name">{preset.name}</span>
                <span className="up-theme-preset-colors">
                  {Object.values(preset.colors).map((color) => <span key={color} style={{ background: color }} />)}
                </span>
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
              <span className="up-theme-preview-brand"><span className="up-theme-preview-mark">U</span>UPTHINK.</span>
              <span>SHOP / AI / ACCOUNT</span>
            </div>
            <div className="up-theme-preview-content">
              <small>FASHION SYSTEM / 2026</small>
              <h3>Your style.<br />Your identity.</h3>
              <button>EXPLORE COLLECTION →</button>
            </div>
          </div>

          <div className="up-theme-actions">
            <button onClick={handleReset}>RESET</button>
            <button className="primary" onClick={handleSave}>SAVE THEME</button>
          </div>
        </section>
      </div>
    </div>
  );
}
