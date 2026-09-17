import { createFileRoute } from "@tanstack/react-router";
import { Archive, Copy, List, Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DEFAULT_THEME_COLORS, type ThemeColors, getStoredTheme, isValidHexColor, loadRemoteTheme, resetTheme, saveThemeToDatabase } from "@/lib/theme";
import { loadBranding, uploadLogo } from "@/lib/branding";
import { createAppearancePalette, deleteAppearancePalette, listAppearancePalettes, setAppearancePaletteStatus, type AppearancePalette, type PaletteStatus, updateAppearancePalette } from "@/lib/appearance-palettes";

export const Route = createFileRoute("/admin/appearance")({
  component: AdminAppearancePage,
  head: () => ({ meta: [{ title: "Appearance — UpThink Admin" }] }),
});

type PreviewDevice = "desktop" | "tablet" | "mobile";
type AppearanceTab = "branding" | "colors" | "typography" | "components" | "content";
type PaletteFilter = "all" | PaletteStatus;
type ColorField = { key: keyof ThemeColors; label: string; description: string };

const COLOR_FIELDS: ColorField[] = [
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

function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(value);
}

function AdminAppearancePage() {
  const initialTheme = getStoredTheme();
  const [colors, setColors] = useState<ThemeColors>(initialTheme);
  const [savedColors, setSavedColors] = useState<ThemeColors>(initialTheme);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [paletteBusy, setPaletteBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [activeTab, setActiveTab] = useState<AppearanceTab>("branding");
  const [palettes, setPalettes] = useState<AppearancePalette[]>([]);
  const [paletteFilter, setPaletteFilter] = useState<PaletteFilter>("all");
  const [paletteSearch, setPaletteSearch] = useState("");
  const [paletteName, setPaletteName] = useState("");
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [paletteCreating, setPaletteCreating] = useState(false);
  const [editingPaletteStatus, setEditingPaletteStatus] = useState<PaletteStatus>("draft");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = JSON.stringify(colors) !== JSON.stringify(savedColors);
  const filteredPalettes = useMemo(() => {
    const query = paletteSearch.trim().toLowerCase();
    return palettes.filter((palette) => {
      const matchesStatus = paletteFilter === "all" || palette.status === paletteFilter;
      const matchesSearch = !query || palette.name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [palettes, paletteFilter, paletteSearch]);
  const draftCount = palettes.filter((palette) => palette.status === "draft").length;
  const archivedCount = palettes.filter((palette) => palette.status === "archived").length;

  useEffect(() => {
    let active = true;
    void loadRemoteTheme().then((remote) => {
      if (active && remote) { setColors(remote); setSavedColors(remote); }
    });
    void loadBranding().then((branding) => { if (active) setLogoUrl(branding.logoUrl); });
    void listAppearancePalettes()
      .then((rows) => { if (active) setPalettes(rows); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to read saved palettes."); });
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
    setSaved(false); setMessage(null); setError(null);
    setColors((current) => ({ ...current, [key]: value }));
  }

  function applyPalette(next: ThemeColors, name?: string) {
    setColors({ ...next }); setSaved(false); setMessage(name ? `Palette “${name}” loaded into the editor.` : "Palette loaded into the editor."); setError(null);
  }

  function startCreatePalette() {
    setEditingPaletteId(null); setPaletteCreating(true); setEditingPaletteStatus("draft"); setPaletteName(""); setMessage(null); setError(null);
  }

  function startEditPalette(palette: AppearancePalette) {
    setEditingPaletteId(palette.id); setPaletteCreating(false); setEditingPaletteStatus(palette.status); setPaletteName(palette.name); applyPalette(palette, palette.name); setMessage(null); setError(null);
  }

  function cancelPaletteEdit() {
    setEditingPaletteId(null); setPaletteCreating(false); setEditingPaletteStatus("draft"); setPaletteName("");
  }

  async function savePalette() {
    if (!paletteName.trim()) { setError("Enter a name for this palette before saving."); return; }
    if (!COLOR_FIELDS.every(({ key }) => isValidHexColor(colors[key]))) { setError("Every palette color must be a valid 6-digit HEX value."); return; }
    setPaletteBusy(true); setMessage(null); setError(null);
    try {
      if (editingPaletteId) {
        const updated = await updateAppearancePalette(editingPaletteId, paletteName, colors, editingPaletteStatus);
        setPalettes((current) => current.map((palette) => palette.id === updated.id ? updated : palette));
        setEditingPaletteStatus(updated.status); setMessage(`Palette “${updated.name}” updated.`);
      } else {
        const created = await createAppearancePalette(paletteName, colors);
        setPalettes((current) => [created, ...current]); setEditingPaletteId(created.id); setPaletteCreating(false); setEditingPaletteStatus(created.status); setMessage(`Palette “${created.name}” saved as draft.`);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save palette."); }
    finally { setPaletteBusy(false); }
  }

  async function changePaletteStatus(palette: AppearancePalette, status: PaletteStatus) {
    setPaletteBusy(true); setMessage(null); setError(null);
    try {
      const updated = await setAppearancePaletteStatus(palette.id, status);
      setPalettes((current) => current.map((item) => item.id === updated.id ? updated : item));
      if (editingPaletteId === updated.id) setEditingPaletteStatus(updated.status);
      setMessage(status === "archived" ? `Palette “${updated.name}” archived.` : `Palette “${updated.name}” restored to drafts.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update palette status."); }
    finally { setPaletteBusy(false); }
  }

  async function removePalette(palette: AppearancePalette) {
    if (!window.confirm(`Delete palette “${palette.name}”? This permanently removes the saved palette.`)) return;
    setPaletteBusy(true); setMessage(null); setError(null);
    try {
      await deleteAppearancePalette(palette.id); setPalettes((current) => current.filter((item) => item.id !== palette.id));
      if (editingPaletteId === palette.id) cancelPaletteEdit(); setMessage(`Palette “${palette.name}” deleted.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete palette."); }
    finally { setPaletteBusy(false); }
  }

  function jumpTo(tab: AppearanceTab) {
    setActiveTab(tab);
    document.getElementById(TABS.find((item) => item.id === tab)?.target ?? "")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function discardChanges() {
    setColors(savedColors); setSaved(false); setMessage("Unsaved changes discarded."); setError(null);
  }

  async function handleSave() {
    setBusy(true); setSaved(false); setMessage(null); setError(null);
    try { const next = await saveThemeToDatabase(colors); setColors(next); setSavedColors(next); setSaved(true); setMessage("Theme saved to Supabase."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save theme."); }
    finally { setBusy(false); }
  }

  async function handleReset() {
    if (!window.confirm("Reset the theme to the default UPTHINK 2026 palette? Unsaved changes will be discarded.")) return;
    setBusy(true); setSaved(false); setMessage(null); setError(null);
    try { const next = await resetTheme(); setColors(next); setSavedColors(next); setSaved(true); setMessage("Theme reset to UPTHINK 2026."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reset theme."); }
    finally { setBusy(false); }
  }

  async function handleLogoChange(file: File | undefined) {
    if (!file) return;
    setLogoBusy(true); setMessage(null); setError(null);
    try { const branding = await uploadLogo(file); setLogoUrl(branding.logoUrl); setMessage("Logo updated. It is now live across the public website."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to upload logo."); }
    finally { setLogoBusy(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  const previewWidth = device === "mobile" ? 390 : device === "tablet" ? 720 : undefined;
  const previewStyle: CSSProperties = { ["--theme-background" as string]: colors.background, ["--theme-foreground" as string]: colors.foreground, ["--theme-accent" as string]: colors.accent, ["--theme-surface" as string]: colors.surface } as CSSProperties;

  return (
    <div className="up-theme-page">
      <style>{`
        .up-theme-page { display:grid; gap:18px; min-width:0; }
        .up-theme-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; padding-bottom:2px; }
        .up-theme-kicker { color:#7d7e79; font-size:9px; font-weight:800; letter-spacing:.2em; }
        .up-theme-header h1 { margin:7px 0 5px; font-size:34px; letter-spacing:-.04em; }
        .up-theme-header p { margin:0; color:#777; font-size:13px; }
        .up-theme-status { color:#2C5745; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
        .up-theme-feedback { margin-top:8px; font-size:11px; line-height:1.5; }
        .up-theme-feedback.success { color:#2C5745; } .up-theme-feedback.error { color:#C44B1D; }
        .up-theme-unsaved { display:flex; align-items:center; gap:8px; color:#58738C; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        .up-theme-unsaved-dot { width:7px; height:7px; border-radius:50%; background:#58738C; box-shadow:0 0 0 3px rgba(88,115,140,.12); }
        .up-theme-tabs { position:sticky; top:0; z-index:20; display:flex; gap:4px; overflow-x:auto; padding:5px; background:#f4f3ef; border:1px solid #e1e0da; scrollbar-width:none; }
        .up-theme-tabs::-webkit-scrollbar { display:none; }
        .up-theme-tab { flex:0 0 auto; border:1px solid transparent; background:transparent; padding:9px 13px; color:#777; font-size:9px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
        .up-theme-tab:hover { color:#222; } .up-theme-tab.active { background:#1b1a17; color:#fff; border-color:#1b1a17; }
        .up-theme-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(330px,.58fr); gap:16px; align-items:start; }
        .up-theme-main { display:grid; gap:16px; min-width:0; }
        .up-theme-panel { background:#fff; border:1px solid #e3e2dc; padding:20px; scroll-margin-top:74px; }
        .up-theme-panel h2 { margin:0 0 5px; font-size:16px; letter-spacing:-.02em; } .up-theme-panel > p { margin:0 0 17px; color:#888; font-size:11px; line-height:1.6; }
        .up-branding-panel { display:grid; grid-template-columns:minmax(170px,.42fr) minmax(0,1fr); gap:18px; align-items:stretch; }
        .up-branding-preview { min-height:130px; border:1px dashed #c9c8c1; background:repeating-conic-gradient(#f5f5f2 0 25%, #fff 0 50%) 50% / 16px 16px; display:grid; place-items:center; padding:18px; }
        .up-branding-preview img { max-width:100%; max-height:90px; object-fit:contain; } .up-branding-fallback { font-size:28px; font-weight:900; letter-spacing:.1em; }
        .up-branding-content { display:flex; flex-direction:column; justify-content:center; min-width:0; } .up-branding-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .up-branding-button { display:inline-flex; align-items:center; justify-content:center; border:1px solid #dddcd5; background:#fff; padding:10px 14px; font-size:9px; font-weight:800; letter-spacing:.06em; cursor:pointer; }
        .up-branding-button.primary { background:var(--theme-accent,#EB7D00); border-color:var(--theme-accent,#EB7D00); color:#111; } .up-branding-button:disabled { opacity:.55; cursor:wait; }
        .up-branding-meta { margin-top:9px; color:#999; font-size:9px; line-height:1.55; } .up-branding-assets { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }
        .up-branding-slot { min-height:62px; padding:10px; border:1px solid #e7e6df; background:#fafaf8; } .up-branding-slot strong { display:block; font-size:9px; letter-spacing:.08em; text-transform:uppercase; } .up-branding-slot span { display:block; margin-top:6px; color:#9a9993; font-size:9px; }

        .up-palette-studio { border:1px solid #e3e2dc; background:#f8f7f3; }
        .up-palette-studio-head { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; padding:17px; border-bottom:1px solid #e3e2dc; background:#fff; }
        .up-palette-studio-head h2 { margin:5px 0 4px; } .up-palette-studio-head p { margin:0; max-width:610px; color:#888; font-size:10px; line-height:1.55; }
        .up-palette-flow { display:flex; flex-wrap:wrap; gap:4px; justify-content:flex-end; } .up-palette-flow span { padding:6px 7px; border:1px solid #e3e2dc; color:#999; background:#fafaf8; font-size:8px; font-weight:900; letter-spacing:.08em; } .up-palette-flow span.active { color:#fff; background:#1b1a17; border-color:#1b1a17; }
        .up-palette-studio-body { display:grid; grid-template-columns:290px minmax(0,1fr); min-height:430px; }
        .up-palette-list { min-width:0; border-right:1px solid #e3e2dc; background:#fbfaf7; } .up-palette-list-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:13px; border-bottom:1px solid #e3e2dc; }
        .up-palette-list-title { display:flex; align-items:center; gap:7px; font-size:10px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; } .up-palette-count { color:#999; font-size:8px; font-weight:700; }
        .up-palette-new { display:inline-flex; align-items:center; gap:5px; border:1px solid #1b1a17; background:#1b1a17; color:#fff; padding:8px 9px; font-size:8px; font-weight:900; letter-spacing:.04em; cursor:pointer; }
        .up-palette-list-tools { padding:10px 11px; border-bottom:1px solid #e3e2dc; } .up-palette-search { position:relative; } .up-palette-search svg { position:absolute; left:8px; top:50%; transform:translateY(-50%); color:#999; }
        .up-palette-search input { width:100%; box-sizing:border-box; border:1px solid #dddcd5; background:#fff; padding:8px 8px 8px 28px; font-size:9px; outline:none; }
        .up-palette-filters { display:flex; gap:4px; margin-top:7px; } .up-palette-filter { flex:1; border:1px solid #dddcd5; background:#fff; color:#888; padding:7px 4px; font-size:7px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; }
        .up-palette-filter.active { border-color:#58738C; background:#eef3f7; color:#334452; } .up-palette-items { display:grid; gap:0; max-height:360px; overflow:auto; }
        .up-palette-item { display:grid; gap:7px; width:100%; padding:11px 12px; border:0; border-bottom:1px solid #e8e7e1; background:transparent; text-align:left; cursor:pointer; }
        .up-palette-item:hover { background:#f5f4f0; } .up-palette-item.active { background:#fff; box-shadow:inset 3px 0 0 #E45826; }
        .up-palette-item-title { display:flex; justify-content:space-between; gap:7px; align-items:center; } .up-palette-item-title strong { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; }
        .up-palette-status { flex:0 0 auto; padding:3px 5px; border:1px solid #d8d7d0; color:#718297; background:#eef3f7; font-size:7px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; } .up-palette-status.archived { color:#8b7a61; background:#f3eee5; border-color:#e3d8c7; }
        .up-palette-mini-swatches { display:grid; grid-template-columns:repeat(6,1fr); gap:2px; } .up-palette-mini-swatches i { height:16px; border:1px solid rgba(0,0,0,.08); } .up-palette-item-meta { color:#aaa; font-size:7px; }
        .up-palette-empty { padding:26px 15px; color:#9a9993; font-size:9px; line-height:1.5; text-align:center; }
        .up-palette-editor { min-width:0; background:#fff; } .up-palette-editor-head { display:flex; justify-content:space-between; align-items:flex-start; gap:15px; padding:16px 17px 13px; border-bottom:1px solid #e3e2dc; }
        .up-palette-editor-kicker { color:#7d7e79; font-size:8px; font-weight:900; letter-spacing:.14em; } .up-palette-editor-head h3 { margin:5px 0 3px; font-size:18px; letter-spacing:-.03em; } .up-palette-editor-head p { margin:0; color:#999; font-size:9px; }
        .up-palette-editor-actions { display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end; } .up-palette-icon { width:30px; height:30px; display:grid; place-items:center; border:1px solid #dddcd5; background:#fff; color:#777; cursor:pointer; } .up-palette-icon:hover { border-color:#1b1a17; color:#1b1a17; } .up-palette-icon.danger:hover { border-color:#edc8bd; background:#fff5f2; color:#C44B1D; }
        .up-palette-editor-form { padding:15px 17px 17px; } .up-palette-name-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:9px; align-items:end; margin-bottom:13px; }
        .up-palette-field label { display:block; margin-bottom:5px; color:#777; font-size:8px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; } .up-palette-field input[type=text] { width:100%; box-sizing:border-box; border:1px solid #d9d8d1; padding:9px 10px; background:#fff; font-size:10px; outline:none; } .up-palette-field input[type=text]:focus { border-color:#2C5745; }
        .up-palette-status-control { display:flex; gap:4px; } .up-palette-status-control button { border:1px solid #dddcd5; background:#fff; color:#888; padding:9px 8px; font-size:7px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; } .up-palette-status-control button.active { border-color:#58738C; background:#eef3f7; color:#334452; }
        .up-palette-color-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; } .up-palette-color { display:grid; grid-template-columns:42px minmax(0,1fr) 83px; align-items:center; gap:8px; padding:9px; border:1px solid #e7e6df; background:#fcfcfa; min-width:0; }
        .up-palette-color input[type=color] { width:34px; height:34px; padding:2px; border:1px solid #d8d7d0; background:#fff; cursor:pointer; } .up-palette-color strong { display:block; font-size:9px; } .up-palette-color small { display:block; margin-top:3px; color:#999; font-size:7px; line-height:1.3; }
        .up-palette-color input[type=text] { width:83px; box-sizing:border-box; border:1px solid #dddcd5; padding:7px; font:600 9px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; outline:none; } .up-palette-color input[type=text]:focus { border-color:#2C5745; }
        .up-palette-editor-footer { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:13px; padding-top:12px; border-top:1px solid #e8e7e1; } .up-palette-readout { color:#999; font-size:8px; line-height:1.45; }
        .up-palette-save-actions { display:flex; gap:5px; flex-wrap:wrap; justify-content:flex-end; } .up-palette-button { display:inline-flex; align-items:center; justify-content:center; gap:5px; border:1px solid #d8d7d0; background:#fff; color:#555; padding:9px 10px; font-size:8px; font-weight:900; letter-spacing:.04em; cursor:pointer; } .up-palette-button.primary { border-color:#2C5745; background:#2C5745; color:#fff; } .up-palette-button:disabled { opacity:.5; cursor:wait; }
        .up-palette-unselected { height:100%; min-height:430px; display:grid; place-items:center; padding:30px; text-align:center; } .up-palette-unselected-inner { max-width:320px; } .up-palette-unselected-inner svg { margin-bottom:9px; color:#aaa; } .up-palette-unselected-inner strong { display:block; font-size:11px; } .up-palette-unselected-inner span { display:block; margin-top:6px; color:#999; font-size:9px; line-height:1.5; }
        .up-theme-preset-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; } .up-theme-preset { display:grid; gap:9px; padding:11px; border:1px solid #e3e2dc; background:#fff; text-align:left; cursor:pointer; } .up-theme-preset:hover { border-color:#2C5745; } .up-theme-preset-name { font-size:10px; font-weight:800; letter-spacing:.04em; } .up-theme-preset-colors { display:flex; gap:3px; } .up-theme-preset-colors span { flex:1; height:18px; border:1px solid rgba(0,0,0,.08); }
        .up-theme-preview-panel { position:sticky; top:58px; min-width:0; } .up-theme-preview-toolbar { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:9px; } .up-theme-preview-toolbar strong { font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
        .up-theme-device-switcher { display:flex; gap:3px; padding:3px; border:1px solid #e3e2dc; background:#f7f6f2; } .up-theme-device { border:0; background:transparent; padding:6px 8px; color:#888; font-size:8px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; } .up-theme-device.active { background:#1b1a17; color:#fff; }
        .up-theme-preview-shell { display:flex; justify-content:center; width:100%; min-height:420px; padding:12px; background:#e9e8e2; border:1px solid #deddd7; overflow:hidden; } .up-theme-preview { width:100%; min-height:396px; padding:20px; background:var(--theme-background,#1B1A17); color:var(--theme-foreground,#F7F1E7); position:relative; overflow:hidden; transition:width .2s ease; }
        .up-theme-preview::after { content:"LIVE PREVIEW"; position:absolute; right:13px; top:12px; font-size:7px; letter-spacing:.16em; opacity:.55; } .up-theme-preview-nav { display:flex; align-items:center; justify-content:space-between; gap:10px; padding-bottom:15px; border-bottom:1px solid color-mix(in oklab,var(--theme-foreground) 20%,transparent); font-size:8px; letter-spacing:.1em; }
        .up-theme-preview-brand { font-weight:900; letter-spacing:.14em; display:flex; align-items:center; gap:7px; } .up-theme-preview-mark { display:inline-grid; place-items:center; width:24px; height:24px; background:var(--theme-accent); color:var(--theme-surface); font-size:8px; font-weight:900; } .up-theme-preview-links { display:flex; gap:10px; opacity:.7; }
        .up-theme-preview-hero { display:grid; gap:12px; padding:38px 0 24px; } .up-theme-preview-eyebrow { font-size:7px; letter-spacing:.18em; opacity:.65; } .up-theme-preview-hero h3 { max-width:480px; margin:0; font-size:clamp(30px,4vw,48px); line-height:.94; letter-spacing:-.05em; } .up-theme-preview-hero p { max-width:430px; margin:0; color:color-mix(in oklab,var(--theme-foreground) 70%,transparent); font-size:10px; line-height:1.6; } .up-theme-preview-cta { width:max-content; border:0; background:var(--theme-accent); color:#111; padding:10px 13px; font-size:8px; font-weight:900; letter-spacing:.1em; }
        .up-theme-preview-products { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-top:4px; } .up-theme-preview-card { min-height:110px; padding:9px; background:var(--theme-surface); color:var(--theme-foreground); } .up-theme-preview-card-art { height:56px; margin-bottom:8px; background:linear-gradient(135deg,var(--theme-secondary),var(--theme-accent)); opacity:.8; } .up-theme-preview-card strong { display:block; font-size:8px; } .up-theme-preview-card span { display:block; margin-top:4px; font-size:7px; opacity:.65; }
        .up-theme-placeholder { min-height:100px; display:grid; place-items:center; border:1px dashed #d9d8d1; color:#aaa; font-size:10px; letter-spacing:.08em; text-transform:uppercase; } .up-theme-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:2px; } .up-theme-action { border:1px solid #dddcd5; background:#fff; padding:10px 13px; font-size:9px; font-weight:900; letter-spacing:.05em; cursor:pointer; } .up-theme-action.primary { background:#1b1a17; border-color:#1b1a17; color:#fff; } .up-theme-action:disabled { opacity:.5; cursor:wait; }
        @media (max-width:1050px) { .up-theme-layout { grid-template-columns:1fr; } .up-theme-preview-panel { position:relative; top:auto; } }
        @media (max-width:760px) { .up-theme-header { align-items:flex-start; flex-direction:column; gap:8px; } .up-branding-panel { grid-template-columns:1fr; } .up-palette-studio-body { grid-template-columns:1fr; } .up-palette-list { border-right:0; border-bottom:1px solid #e3e2dc; } .up-palette-items { max-height:240px; } .up-palette-name-row { grid-template-columns:1fr; } .up-palette-color-grid { grid-template-columns:1fr; } .up-theme-preset-grid { grid-template-columns:1fr; } .up-palette-studio-head { flex-direction:column; } .up-palette-flow { justify-content:flex-start; } .up-palette-editor-footer { align-items:stretch; flex-direction:column; } .up-palette-save-actions { width:100%; } .up-palette-button { flex:1; } }
        @media (max-width:520px) { .up-theme-panel { padding:14px; } .up-branding-assets { grid-template-columns:1fr; } .up-theme-preview { padding:14px; } .up-theme-preview-links { display:none; } .up-theme-preview-products { grid-template-columns:1fr; } .up-theme-preview-card { min-height:72px; } .up-palette-studio-body { min-height:0; } .up-palette-color { grid-template-columns:38px minmax(0,1fr); } .up-palette-color input[type=text] { grid-column:2; width:100%; } }
      `}</style>

      <header className="up-theme-header"><div><div className="up-theme-kicker">ADMIN / APPEARANCE / BRANDING</div><h1>Appearance</h1><p>Control brand assets, colors and the visual system from one workspace.</p>{message && <div className="up-theme-feedback success">{message}</div>}{error && <div className="up-theme-feedback error">{error}</div>}</div><div>{hasUnsavedChanges ? <div className="up-theme-unsaved"><span className="up-theme-unsaved-dot" />Unsaved changes</div> : <div className="up-theme-status">Theme synced</div>}</div></header>
      <nav className="up-theme-tabs" aria-label="Appearance sections">{TABS.map((tab) => <button key={tab.id} type="button" className={`up-theme-tab${activeTab === tab.id ? " active" : ""}`} onClick={() => jumpTo(tab.id)}>{tab.label}</button>)}</nav>

      <div className="up-theme-layout"><main className="up-theme-main">
        <section id="appearance-branding" className="up-theme-panel"><h2>Brand assets</h2><p>Keep the public-facing identity consistent across the storefront.</p><div className="up-branding-panel"><div className="up-branding-preview">{logoUrl ? <img src={logoUrl} alt="Current site logo" /> : <div className="up-branding-fallback">WEARO</div>}</div><div className="up-branding-content"><div className="up-branding-actions"><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(event) => void handleLogoChange(event.target.files?.[0])} /><button type="button" className="up-branding-button primary" disabled={logoBusy} onClick={() => fileInputRef.current?.click()}>{logoBusy ? "Uploading…" : "Upload logo"}</button></div><div className="up-branding-meta">PNG, JPG, WEBP or SVG. The current logo remains the source used by the public site.</div><div className="up-branding-assets"><div className="up-branding-slot"><strong>Dark logo</strong><span>Planned asset</span></div><div className="up-branding-slot"><strong>Monogram</strong><span>Planned asset</span></div><div className="up-branding-slot"><strong>Favicon</strong><span>Planned asset</span></div></div></div></div></section>

        <section id="appearance-colors" className="up-theme-panel"><div className="up-palette-studio"><div className="up-palette-studio-head"><div><div className="up-theme-kicker">COLOR SYSTEM / CRUDL</div><h2>Palette Studio</h2><p>L keeps the saved palettes visible in one place. Select a record to R read its six HEX tokens, then U update it, archive/restore it, or D delete it. C creates a new draft. Save Theme is still the separate publish action for the live storefront.</p></div><div className="up-palette-flow" aria-label="Palette CRUDL flow"><span className="active">L LIST</span><span>C CREATE</span><span>R READ</span><span>U UPDATE</span><span>D DELETE</span></div></div>
          <div className="up-palette-studio-body"><aside className="up-palette-list" aria-label="Saved palettes"><div className="up-palette-list-head"><div className="up-palette-list-title"><List size={13} /> Saved <span className="up-palette-count">{palettes.length}</span></div><button type="button" className="up-palette-new" onClick={startCreatePalette}><Plus size={11} /> New</button></div><div className="up-palette-list-tools"><div className="up-palette-search"><Search size={12} /><input value={paletteSearch} onChange={(event) => setPaletteSearch(event.target.value)} placeholder="Search palette…" aria-label="Search palettes" /></div><div className="up-palette-filters">{(["all", "draft", "archived"] as PaletteFilter[]).map((filter) => <button key={filter} type="button" className={`up-palette-filter${paletteFilter === filter ? " active" : ""}`} onClick={() => setPaletteFilter(filter)}>{filter === "all" ? `All ${palettes.length}` : filter === "draft" ? `Draft ${draftCount}` : `Archived ${archivedCount}`}</button>)}</div></div><div className="up-palette-items">{filteredPalettes.length === 0 ? <div className="up-palette-empty">{paletteSearch ? "No palettes match your search." : "No saved palettes in this view. Create a palette from the current colors."}</div> : filteredPalettes.map((palette) => <button key={palette.id} type="button" className={`up-palette-item${editingPaletteId === palette.id ? " active" : ""}`} onClick={() => startEditPalette(palette)}><span className="up-palette-item-title"><strong>{palette.name}</strong><span className={`up-palette-status${palette.status === "archived" ? " archived" : ""}`}>{palette.status}</span></span><span className="up-palette-mini-swatches">{COLOR_FIELDS.map(({ key }) => <i key={key} style={{ background: palette[key] }} title={palette[key]} />)}</span><span className="up-palette-item-meta">Updated {new Date(palette.updated_at).toLocaleString("vi-VN")}</span></button>)}</div></aside>

            <div className="up-palette-editor">{(paletteCreating || editingPaletteId) ? <><div className="up-palette-editor-head"><div><div className="up-palette-editor-kicker">{paletteCreating ? "C CREATE" : "R READ / U UPDATE"}</div><h3>{paletteName || "Untitled palette"}</h3><p>{paletteCreating ? "Start from the current colors, name the palette, then save it as a draft." : "Edit the saved snapshot here. Changes reach the database only after Update."}</p></div><div className="up-palette-editor-actions"><button type="button" className="up-palette-icon" title="Copy HEX values" aria-label="Copy HEX values" onClick={() => copyText(COLOR_FIELDS.map(({ key }) => `${key}: ${colors[key]}`).join("\n"))}><Copy size={13} /></button>{editingPaletteId && <button type="button" className="up-palette-icon danger" title="Delete palette" aria-label="Delete palette" disabled={paletteBusy} onClick={() => { const palette = palettes.find((item) => item.id === editingPaletteId); if (palette) void removePalette(palette); }}><Trash2 size={13} /></button>}</div></div><div className="up-palette-editor-form"><div className="up-palette-name-row"><div className="up-palette-field"><label htmlFor="palette-name">Palette name</label><input id="palette-name" type="text" value={paletteName} maxLength={80} onChange={(event) => setPaletteName(event.target.value)} placeholder="e.g. WEARO Autumn 2026" /></div><div className="up-palette-field"><label>Status</label><div className="up-palette-status-control"><button type="button" className={editingPaletteStatus === "draft" ? "active" : ""} onClick={() => setEditingPaletteStatus("draft")}>Draft</button><button type="button" className={editingPaletteStatus === "archived" ? "active" : ""} onClick={() => setEditingPaletteStatus("archived")}>Archived</button></div></div></div><div className="up-palette-color-grid">{COLOR_FIELDS.map(({ key, label, description }) => <div className="up-palette-color" key={key}><input aria-label={`${label} color picker`} type="color" value={isValidHexColor(colors[key]) ? colors[key] : "#000000"} onChange={(event) => updateColor(key, event.target.value.toUpperCase())} /><div><strong>{label}</strong><small>{description}</small></div><input aria-label={`${label} HEX`} type="text" value={colors[key]} maxLength={7} onChange={(event) => updateColor(key, event.target.value.toUpperCase())} /></div>)}</div><div className="up-palette-editor-footer"><div className="up-palette-readout">R reads the six stored HEX values. U changes name, colors or status. D permanently removes the record. Archive keeps the record available to L.</div><div className="up-palette-save-actions"><button type="button" className="up-palette-button" onClick={() => applyPalette(colors, paletteName)}>Use in theme</button><button type="button" className="up-palette-button" onClick={cancelPaletteEdit}><X size={10} /> Close</button><button type="button" className="up-palette-button primary" disabled={paletteBusy} onClick={() => void savePalette()}>{paletteBusy ? (editingPaletteId ? "Updating…" : "Saving…") : editingPaletteId ? <><Pencil size={10} /> Update</> : <><Plus size={10} /> Save draft</>}</button>{editingPaletteId && (editingPaletteStatus === "archived" ? <button type="button" className="up-palette-button" disabled={paletteBusy} onClick={() => { const palette = palettes.find((item) => item.id === editingPaletteId); if (palette) void changePaletteStatus(palette, "draft"); }}><RotateCcw size={10} /> Restore</button> : <button type="button" className="up-palette-button" disabled={paletteBusy} onClick={() => { const palette = palettes.find((item) => item.id === editingPaletteId); if (palette) void changePaletteStatus(palette, "archived"); }}><Archive size={10} /> Archive</button>)}</div></div></div></> : <div className="up-palette-unselected"><div className="up-palette-unselected-inner"><List size={24} /><strong>Select a palette from the list</strong><span>READ its six HEX values, make changes, then UPDATE. Use CREATE to save the current theme as a new draft.</span><button type="button" className="up-palette-button primary" style={{ marginTop: 12 }} onClick={startCreatePalette}><Plus size={10} /> Create from current colors</button></div></div>}</div>
          </div></div></section>

        <section className="up-theme-panel"><h2>Palette library presets</h2><p>Built-in references remain available as quick starting points. They are not deleted when custom palettes are removed.</p><div className="up-theme-preset-grid">{PRESETS.map((preset) => <button type="button" className="up-theme-preset" key={preset.name} onClick={() => applyPalette(preset.colors, preset.name)}><span className="up-theme-preset-name">{preset.name}</span><span className="up-theme-preset-colors">{COLOR_FIELDS.map(({ key }) => <span key={key} style={{ background: preset.colors[key] }} />)}</span></button>)}</div></section>
        <section id="appearance-typography" className="up-theme-panel"><h2>Typography</h2><p>Typography controls are reserved for the next design-system milestone so the current font stack remains stable.</p><div className="up-theme-placeholder">Typography manager — P1</div></section>
        <section id="appearance-components" className="up-theme-panel"><h2>Components</h2><p>Component tokens and previews will be connected after the global palette CRUD is stable.</p><div className="up-theme-placeholder">Component preview — P1</div></section>
        <section id="appearance-content" className="up-theme-panel"><h2>Content</h2><p>Homepage content controls will be added without changing the current public-site structure.</p><div className="up-theme-placeholder">Content controls — P1</div></section>
        <div className="up-theme-actions">{hasUnsavedChanges && <button type="button" className="up-theme-action" onClick={discardChanges} disabled={busy}>Discard</button>}<button type="button" className="up-theme-action" onClick={() => void handleReset()} disabled={busy}>Reset</button><button type="button" className="up-theme-action primary" onClick={() => void handleSave()} disabled={busy}>{busy ? "Saving…" : saved ? "Saved" : "Save Theme"}</button></div>
      </main>

      <aside className="up-theme-preview-panel"><div className="up-theme-preview-toolbar"><strong>Live Preview</strong><div className="up-theme-device-switcher">{(["desktop", "tablet", "mobile"] as PreviewDevice[]).map((item) => <button key={item} type="button" className={`up-theme-device${device === item ? " active" : ""}`} onClick={() => setDevice(item)}>{item}</button>)}</div></div><div className="up-theme-preview-shell"><div className="up-theme-preview" style={{ ...previewStyle, width: previewWidth ? `${previewWidth}px` : "100%" }}><div className="up-theme-preview-nav"><div className="up-theme-preview-brand"><span className="up-theme-preview-mark">W</span>WEARO</div><div className="up-theme-preview-links"><span>SHOP</span><span>AI TRY-ON</span><span>ACCOUNT</span></div><span>MENU</span></div><div className="up-theme-preview-hero"><span className="up-theme-preview-eyebrow">NEW SEASON / DIGITAL FIT</span><h3>Wear it your way.</h3><p>A live visual check for the global palette before the theme is published to the storefront.</p><button type="button" className="up-theme-preview-cta">EXPLORE COLLECTION</button></div><div className="up-theme-preview-products">{["Night Shift Set", "Studio Overshirt", "Everyday Tee"].map((name) => <div className="up-theme-preview-card" key={name}><div className="up-theme-preview-card-art" /><strong>{name}</strong><span>Preview product</span></div>)}</div></div></div></aside>
      </div>
    </div>
  );
}
