import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Eye, GitCompare, Plus, RefreshCw, RotateCcw, Send, Trash2 } from "lucide-react";
import { createAppearanceTheme, deleteAppearanceTheme, listAppearanceThemes, publishAppearanceTheme, type AppearanceTheme } from "@/lib/appearance-theme-workflow";
import { getStoredTheme, openThemePreview, saveThemeToDatabase } from "@/lib/theme";

export const Route = createFileRoute("/admin/appearance/library")({
  component: AppearanceThemeLibraryPage,
  head: () => ({ meta: [{ title: "Theme Library — UpThink Admin" }] }),
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function diffKeys(a: AppearanceTheme, b: AppearanceTheme) {
  return (Object.keys(a.theme_data) as Array<keyof AppearanceTheme["theme_data"]>).filter((key) => a.theme_data[key] !== b.theme_data[key]);
}

function AppearanceThemeLibraryPage() {
  const [themes, setThemes] = useState<AppearanceTheme[]>([]);
  const [selected, setSelected] = useState<AppearanceTheme | null>(null);
  const [compare, setCompare] = useState<AppearanceTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const rows = await listAppearanceThemes();
      setThemes(rows);
      setSelected((current) => current ? rows.find((row) => row.id === current.id) ?? null : rows[0] ?? null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load theme library."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const differences = useMemo(() => selected && compare ? diffKeys(selected, compare) : [], [selected, compare]);

  async function createFromCurrent() {
    setBusy(true); setMessage(null); setError(null);
    try { await createAppearanceTheme(`WEARO Draft ${new Date().toLocaleDateString("vi-VN")}`, getStoredTheme()); await refresh(); setMessage("New draft created from the current editor theme."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create theme."); }
    finally { setBusy(false); }
  }

  async function rollback(theme: AppearanceTheme) {
    if (theme.status === "draft") return;
    setBusy(true); setMessage(null); setError(null);
    try { await saveThemeToDatabase(theme.theme_data); await openThemePreview(theme.theme_data); setMessage(`Theme “${theme.name}” loaded as the current draft. Publish it only after review.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load rollback draft."); }
    finally { setBusy(false); }
  }

  async function publish(theme: AppearanceTheme) {
    setBusy(true); setMessage(null); setError(null);
    try { await publishAppearanceTheme(theme.id); await refresh(); setMessage(`Theme “${theme.name}” published.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to publish theme."); }
    finally { setBusy(false); }
  }

  async function remove(theme: AppearanceTheme) {
    if (theme.status !== "draft" || !window.confirm(`Delete draft “${theme.name}”?`)) return;
    setBusy(true); setMessage(null); setError(null);
    try { await deleteAppearanceTheme(theme.id); await refresh(); setMessage("Draft deleted."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete theme."); }
    finally { setBusy(false); }
  }

  return <div className="up-theme-library">
    <style>{`
      .up-theme-library{display:grid;gap:18px}.up-theme-library-header{display:flex;justify-content:space-between;align-items:flex-end;gap:18px}.up-theme-library-kicker{font-size:9px;font-weight:800;letter-spacing:.18em;color:#81827d}.up-theme-library h1{margin:7px 0 5px;font-size:34px;letter-spacing:-.04em}.up-theme-library p{margin:0;color:#777;font-size:12px;line-height:1.55}.up-theme-library-actions,.up-theme-library-toolbar{display:flex;gap:8px;flex-wrap:wrap}.up-theme-library button,.up-theme-library a{display:inline-flex;align-items:center;gap:7px;border:1px solid #dddcd5;background:#fff;color:#333;padding:10px 12px;font-size:9px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;cursor:pointer}.up-theme-library button.accent{background:#f2a900;border-color:#f2a900;color:#111}.up-theme-library button:disabled{opacity:.45;cursor:not-allowed}.up-theme-library-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:14px}.up-theme-library-list,.up-theme-library-detail{background:#fff;border:1px solid #e3e2dc}.up-theme-library-row{width:100%;display:grid;grid-template-columns:1fr auto;gap:12px;padding:15px;border:0;border-bottom:1px solid #ecebe5;background:#fff;text-align:left;cursor:pointer}.up-theme-library-row:last-child{border-bottom:0}.up-theme-library-row.active{background:#fafaf7}.up-theme-library-name{font-weight:800;font-size:13px}.up-theme-library-meta{display:block;margin-top:4px;color:#888;font-size:9px}.up-theme-library-status{padding:4px 7px;height:max-content;font-size:8px;font-weight:900;text-transform:uppercase}.up-theme-library-status.published{background:#def4e8;color:#167243}.up-theme-library-status.draft{background:#fff1c9;color:#916b00}.up-theme-library-swatches{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:15px 0}.up-theme-library-swatches span{height:28px;border:1px solid rgba(0,0,0,.1)}.up-theme-library-detail{padding:18px}.up-theme-library-detail h2{margin:0;font-size:19px}.up-theme-library-detail small{color:#888}.up-theme-library-detail dl{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:16px 0}.up-theme-library-detail dt,.up-theme-library-detail dd{margin:0;padding:8px;background:#fafaf7;font-size:9px}.up-theme-library-detail dd{font-family:ui-monospace,monospace;text-align:right}.up-theme-library-empty{padding:30px;color:#888;font-size:11px}.up-theme-library-compare{padding:12px;background:#fafaf7;border:1px solid #e3e2dc;font-size:10px}.up-theme-library-feedback{padding:11px 14px;background:#fff;border:1px solid #e3e2dc;font-size:11px}.up-theme-library-feedback.error{color:#a32727}@media(max-width:850px){.up-theme-library-header{align-items:flex-start;flex-direction:column}.up-theme-library-layout{grid-template-columns:1fr}}
    `}</style>
    <header className="up-theme-library-header"><div><div className="up-theme-library-kicker">APPEARANCE / LIBRARY</div><h1>Theme Library</h1><p>Saved themes act as the history. Compare two snapshots, load an older theme as a draft, then publish deliberately.</p></div><Link to="/admin/appearance">← Appearance</Link></header>
    <div className="up-theme-library-toolbar"><button type="button" className="accent" onClick={() => void createFromCurrent()} disabled={busy}><Plus size={13}/> New snapshot</button><button type="button" onClick={() => void refresh()} disabled={loading || busy}><RefreshCw size={13}/> Refresh</button></div>
    <div className="up-theme-library-layout">
      <section className="up-theme-library-list">{loading ? <div className="up-theme-library-empty">Loading theme history…</div> : themes.length === 0 ? <div className="up-theme-library-empty">No saved themes yet.</div> : themes.map((theme) => <button key={theme.id} type="button" className={`up-theme-library-row${selected?.id === theme.id ? " active" : ""}`} onClick={() => setSelected(theme)}><span><span className="up-theme-library-name">{theme.name}</span><span className="up-theme-library-meta">{formatDate(theme.updated_at)}{theme.published_at ? ` · Published ${formatDate(theme.published_at)}` : ""}</span></span><span className={`up-theme-library-status ${theme.status}`}>{theme.status}</span></button>)}</section>
      <aside className="up-theme-library-detail">{selected ? <><h2>{selected.name}</h2><small>{selected.id}</small><div className="up-theme-library-swatches">{Object.entries(selected.theme_data).map(([key,value]) => <span key={key} title={`${key}: ${value}`} style={{background:value}} />)}</div><dl>{Object.entries(selected.theme_data).map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="up-theme-library-actions"><button type="button" onClick={() => void openThemePreview(selected.theme_data)} disabled={busy}><Eye size={13}/> Preview</button><button type="button" onClick={() => setCompare(compare?.id === selected.id ? null : selected)} disabled={busy}><GitCompare size={13}/> Compare</button>{selected.status === "published" && <button type="button" onClick={() => void rollback(selected)} disabled={busy}><RotateCcw size={13}/> Load as draft</button>}{selected.status === "draft" && <button type="button" className="accent" onClick={() => void publish(selected)} disabled={busy}><Send size={13}/> Publish</button>}{selected.status === "draft" && <button type="button" onClick={() => void remove(selected)} disabled={busy}><Trash2 size={13}/> Delete</button>}<button type="button" onClick={() => { void navigator.clipboard?.writeText(JSON.stringify(selected.theme_data,null,2)); setMessage("Theme JSON copied."); }} disabled={busy}><Copy size={13}/> Copy JSON</button></div>{compare && compare.id !== selected.id && <div className="up-theme-library-compare"><strong>Compare with {compare.name}</strong><br/>{differences.length ? `${differences.length} token(s) differ: ${differences.join(", ")}.` : "No color token differences."}</div>}</> : <div className="up-theme-library-empty">Select a saved theme.</div>}</aside>
    </div>
    {message && <div className="up-theme-library-feedback">✓ {message}</div>}{error && <div className="up-theme-library-feedback error">{error}</div>}
  </div>;
}
