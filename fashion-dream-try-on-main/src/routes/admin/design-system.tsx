import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { DEFAULT_THEME_COLORS, getStoredTheme, type ThemeColors } from "@/lib/theme";
import { contrastLevel, contrastRatio, semanticTokens, shadeScale, TYPOGRAPHY_TOKENS } from "@/lib/design-system";

export const Route = createFileRoute("/admin/design-system")({
  component: AdminDesignSystemPage,
  head: () => ({ meta: [{ title: "Design System — UpThink Admin" }] }),
});

const COLOR_NAMES: Array<keyof ThemeColors> = ["primary", "secondary", "background", "surface", "accent", "foreground"];

function AdminDesignSystemPage() {
  const [colors, setColors] = useState<ThemeColors>(() => getStoredTheme());
  const [selectedColor, setSelectedColor] = useState<keyof ThemeColors>("accent");
  const [contrastForeground, setContrastForeground] = useState("#FFFFFF");
  const [contrastBackground, setContrastBackground] = useState(colors.accent);
  const [copied, setCopied] = useState<string | null>(null);

  const tokens = useMemo(() => semanticTokens(colors), [colors]);
  const shades = useMemo(() => shadeScale(colors[selectedColor]), [colors, selectedColor]);
  const ratio = contrastRatio(contrastForeground, contrastBackground);
  const level = contrastLevel(ratio);

  function updateColor(key: keyof ThemeColors, value: string) {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) setColors((current) => ({ ...current, [key]: value.toUpperCase() }));
  }

  function copy(value: string) {
    if (navigator.clipboard) void navigator.clipboard.writeText(value).then(() => { setCopied(value); window.setTimeout(() => setCopied(null), 1200); });
  }

  function reset() {
    setColors(DEFAULT_THEME_COLORS);
    setContrastBackground(DEFAULT_THEME_COLORS.accent);
  }

  return (
    <div className="up-ds-page">
      <style>{`
        .up-ds-page{display:grid;gap:14px;min-width:0}.up-ds-header{display:flex;justify-content:space-between;align-items:flex-end;gap:18px}.up-ds-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:#858681}.up-ds-header h1{margin:6px 0 4px;font-size:32px;letter-spacing:-.04em}.up-ds-header p{margin:0;color:#777;font-size:12px;line-height:1.5}.up-ds-reset{border:1px solid #dddcd5;background:#fff;padding:10px 13px;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
        .up-ds-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(310px,.75fr);gap:14px;align-items:start}.up-ds-panel{background:#fff;border:1px solid #e3e2dc;padding:17px;min-width:0}.up-ds-panel h2{font-size:15px;margin:0 0 4px}.up-ds-panel>p{font-size:10px;color:#888;margin:0 0 13px;line-height:1.5}.up-ds-token-list{display:grid;gap:5px}.up-ds-token{display:grid;grid-template-columns:145px 42px minmax(110px,1fr) auto;align-items:center;gap:9px;padding:8px;border:1px solid #eeeDE8}.up-ds-token code{font-size:9px;color:#555}.up-ds-token small{color:#888;font-size:9px}.up-ds-swatch{width:30px;height:22px;border:1px solid rgba(0,0,0,.12)}.up-ds-copy{border:1px solid #dddcd5;background:#fff;padding:5px 7px;cursor:pointer}.up-ds-copy svg{width:12px;height:12px}
        .up-ds-color-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.up-ds-color{display:grid;grid-template-columns:35px 1fr;gap:8px;align-items:center;border:1px solid #e3e2dc;background:#fff;padding:8px;text-align:left;cursor:pointer}.up-ds-color.active{border-color:#f2a900;box-shadow:inset 3px 0 #f2a900}.up-ds-color-swatch{width:30px;height:30px;border:1px solid rgba(0,0,0,.1)}.up-ds-color strong{display:block;font-size:10px;text-transform:uppercase}.up-ds-color span{font-size:8px;color:#888}.up-ds-shades{display:grid;grid-template-columns:repeat(9,1fr);gap:4px}.up-ds-shade{min-width:0}.up-ds-shade div{height:36px;border:1px solid rgba(0,0,0,.1)}.up-ds-shade code{display:block;margin-top:4px;font-size:7px;overflow:hidden;text-overflow:ellipsis}.up-ds-form{display:grid;grid-template-columns:1fr 1fr;gap:9px}.up-ds-form label{display:grid;gap:5px;font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.up-ds-form input{width:100%;border:1px solid #dddcd5;padding:9px;background:#fff;font-family:monospace;font-size:11px}.up-ds-contrast-preview{margin-top:11px;padding:22px;background:${contrastBackground};color:${contrastForeground};border:1px solid #dddcd5}.up-ds-contrast-preview strong{display:block;font-size:20px}.up-ds-contrast-preview span{font-size:10px}.up-ds-contrast-result{display:flex;justify-content:space-between;align-items:center;margin-top:9px;font-size:10px}.up-ds-pass{color:#2c5745;font-weight:900}.up-ds-fail{color:#c44b1d;font-weight:900}.up-ds-type-list{display:grid;gap:6px}.up-ds-type{display:grid;grid-template-columns:90px minmax(0,1fr) auto;gap:10px;align-items:center;border-bottom:1px solid #eeeDE8;padding:8px 0}.up-ds-type b{font-size:9px;text-transform:uppercase;letter-spacing:.08em}.up-ds-type code{font-size:9px;color:#666}.up-ds-type-sample{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.up-ds-components{display:grid;gap:9px}.up-ds-component-row{display:flex;flex-wrap:wrap;gap:7px;align-items:center}.up-ds-component-row button{border:1px solid #dddcd5;background:#fff;padding:9px 13px;font-size:9px;font-weight:900;cursor:pointer}.up-ds-component-row .primary{background:${colors.primary};color:${colors.foreground};border-color:${colors.primary}}.up-ds-component-row .accent{background:${colors.accent};color:${colors.background};border-color:${colors.accent}}.up-ds-component-row .surface{background:${colors.surface};color:${colors.foreground};border-color:${colors.surface}}.up-ds-field{display:flex;gap:8px;align-items:center}.up-ds-field input{width:110px;border:1px solid #dddcd5;padding:8px;font-family:monospace;font-size:10px}.up-ds-note{font-size:9px;color:#888}.up-ds-copied{font-size:9px;color:#2c5745;font-weight:800}.up-ds-inspector{display:grid;gap:6px}.up-ds-inspector-row{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid #eeeDE8;font-size:9px}.up-ds-inspector-row code{color:#666}.up-ds-inspector-row strong{font-family:monospace;font-size:9px}.up-ds-wide{grid-column:1/-1}
        @media(max-width:850px){.up-ds-grid{grid-template-columns:1fr}.up-ds-wide{grid-column:auto}.up-ds-color-grid{grid-template-columns:repeat(2,1fr)}.up-ds-shades{grid-template-columns:repeat(5,1fr)}}@media(max-width:560px){.up-ds-header{align-items:flex-start;flex-direction:column}.up-ds-token{grid-template-columns:1fr 35px auto}.up-ds-token small{grid-column:1/-1}.up-ds-form{grid-template-columns:1fr}.up-ds-color-grid{grid-template-columns:1fr}}
      `}</style>

      <header className="up-ds-header">
        <div><div className="up-ds-kicker">SYSTEM / DESIGN TOKENS</div><h1>Design System</h1><p>Semantic tokens, accessibility checks and component rules derived from the current theme.</p></div>
        <button className="up-ds-reset" type="button" onClick={reset}><RefreshCw size={12}/> Reset preview</button>
      </header>

      <div className="up-ds-grid">
        <section className="up-ds-panel">
          <h2>Semantic Color Tokens</h2>
          <p>One meaning per token. Components should consume semantic roles instead of hard-coded colors.</p>
          <div className="up-ds-token-list">
            {tokens.map((token) => <div className="up-ds-token" key={token.name}><code>{token.name}</code><span className="up-ds-swatch" style={{background:token.value}}/><small>{token.role}</small><button className="up-ds-copy" type="button" onClick={()=>copy(token.value)} title="Copy HEX"><Copy/></button></div>)}
          </div>
        </section>

        <section className="up-ds-panel">
          <h2>Token Inspector</h2>
          <p>Inspect the six foundational values currently driving the design system preview.</p>
          <div className="up-ds-inspector">{COLOR_NAMES.map((key)=><div className="up-ds-inspector-row" key={key}><span>--theme-{key}</span><strong>{colors[key]}</strong></div>)}</div>
          {copied && <div className="up-ds-copied">✓ Copied {copied}</div>}
        </section>

        <section className="up-ds-panel">
          <h2>Shade Generator</h2>
          <p>Select a theme token to generate a lightweight 9-step working scale.</p>
          <div className="up-ds-color-grid">{COLOR_NAMES.map((key)=><button type="button" className={`up-ds-color${selectedColor===key?" active":""}`} key={key} onClick={()=>setSelectedColor(key)}><span className="up-ds-color-swatch" style={{background:colors[key]}}/><span><strong>{key}</strong><span>{colors[key]}</span></span></button>)}</div>
          <div className="up-ds-shades" style={{marginTop:12}}>{shades.map((shade,index)=><div className="up-ds-shade" key={`${shade}-${index}`}><div style={{background:shade}}/><code>{shade}</code></div>)}</div>
        </section>

        <section className="up-ds-panel">
          <h2>Contrast Checker</h2>
          <p>WCAG-oriented ratio check for text and surface combinations.</p>
          <div className="up-ds-form"><label>Foreground<input value={contrastForeground} onChange={e=>setContrastForeground(e.target.value.toUpperCase())}/></label><label>Background<input value={contrastBackground} onChange={e=>setContrastBackground(e.target.value.toUpperCase())}/></label></div>
          <div className="up-ds-contrast-preview"><strong>WEARO / Aa</strong><span>Accessible component preview</span></div>
          <div className="up-ds-contrast-result"><span>Contrast ratio: <strong>{ratio ? `${ratio.toFixed(2)}:1` : "Invalid color"}</strong></span><span className={level === "Fail" ? "up-ds-fail" : "up-ds-pass"}>{level}</span></div>
        </section>

        <section className="up-ds-panel">
          <h2>Typography Tokens</h2>
          <p>Compact semantic typography scale for editorial and commerce interfaces.</p>
          <div className="up-ds-type-list">{TYPOGRAPHY_TOKENS.map(token=><div className="up-ds-type" key={token.name}><b>{token.name}</b><code>{token.value}</code><span className="up-ds-type-sample" style={{fontSize:token.name==="Display"?24:token.name==="Heading"?17:token.name==="Body"?13:10}}>{token.role}</span></div>)}</div>
        </section>

        <section className="up-ds-panel">
          <h2>Component Preview</h2>
          <p>Quick visual check of common actions and surfaces against the active token set.</p>
          <div className="up-ds-components"><div className="up-ds-component-row"><button className="primary">PRIMARY ACTION</button><button className="accent">ACCENT CTA</button><button className="surface">SURFACE</button><button>SECONDARY</button></div><div className="up-ds-field"><input aria-label="Preview input" placeholder="Input field"/><span className="up-ds-note">Focus, hierarchy and spacing preview</span></div></div>
        </section>

        <section className="up-ds-panel up-ds-wide">
          <h2>Editable Token Preview</h2>
          <p>These edits are local to this design-system preview. Use Appearance → Save Draft when you want to change the actual theme.</p>
          <div className="up-ds-color-grid">{COLOR_NAMES.map(key=><label className="up-ds-color" key={key}><span className="up-ds-color-swatch" style={{background:colors[key]}}/><span><strong>{key}</strong><input value={colors[key]} onChange={e=>updateColor(key,e.target.value)} aria-label={`${key} HEX`}/></span></label>)}</div>
        </section>
      </div>
    </div>
  );
}
