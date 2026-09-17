import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Pencil, RefreshCw, RotateCcw, Save, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { discardThemeDraft, getStoredTheme, getThemeWorkflow, openThemePreview, publishTheme, resetTheme, saveThemeToDatabase, type ThemeWorkflowRecord } from "@/lib/theme";

export const Route = createFileRoute("/admin/appearance/workflow")({
  component: AppearanceWorkflowPage,
  head: () => ({ meta: [{ title: "Theme Workflow — UpThink Admin" }] }),
});

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function ThemeCard({ title, record, muted }: { title: string; record: ThemeWorkflowRecord | null; muted?: boolean }) {
  return (
    <article className={`up-theme-workflow-card${muted ? " muted" : ""}`}>
      <div className="up-theme-workflow-card-head">
        <div><span className="up-theme-workflow-label">{title}</span><strong>{record?.name ?? "No saved state"}</strong></div>
        {record && <span className={`up-theme-workflow-status ${record.status}`}>{record.status}</span>}
      </div>
      {record ? (
        <>
          <div className="up-theme-workflow-swatches">
            {Object.entries(record.theme_data).map(([key, value]) => <span key={key} title={`${key}: ${value}`} style={{ background: value }} />)}
          </div>
          <div className="up-theme-workflow-meta">
            Updated {formatDate(record.updated_at)}{record.published_at ? ` · Published ${formatDate(record.published_at)}` : ""}
          </div>
        </>
      ) : <div className="up-theme-workflow-empty">The workflow has no saved {title.toLowerCase()} yet.</div>}
    </article>
  );
}

function AppearanceWorkflowPage() {
  const [published, setPublished] = useState<ThemeWorkflowRecord | null>(null);
  const [draft, setDraft] = useState<ThemeWorkflowRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await getThemeWorkflow();
      setPublished(state.published);
      setDraft(state.draft);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to read theme workflow."));
  }, [refresh]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setMessage(null); setError(null);
    try { await action(); await refresh(); setMessage(success); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Theme workflow action failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="up-theme-workflow-page">
      <style>{`
        .up-theme-workflow-page { display:grid; gap:18px; }
        .up-theme-workflow-header { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; }
        .up-theme-workflow-kicker { color:#7d7e79; font-size:9px; font-weight:800; letter-spacing:.2em; }
        .up-theme-workflow-header h1 { margin:7px 0 5px; font-size:34px; letter-spacing:-.04em; }
        .up-theme-workflow-header p { margin:0; color:#777; font-size:13px; max-width:680px; line-height:1.55; }
        .up-theme-workflow-back { color:#555; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; }
        .up-theme-workflow-statusbar { display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:12px 14px; background:#fff; border:1px solid #e3e2dc; }
        .up-theme-workflow-dot { width:7px; height:7px; border-radius:50%; background:${draft ? "#f2a900" : "#2c5745"}; }
        .up-theme-workflow-statusbar strong { font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
        .up-theme-workflow-statusbar span { color:#777; font-size:11px; }
        .up-theme-workflow-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .up-theme-workflow-card { background:#fff; border:1px solid #e3e2dc; padding:18px; min-width:0; }
        .up-theme-workflow-card.muted { background:#fafaf7; }
        .up-theme-workflow-card-head { display:flex; justify-content:space-between; gap:15px; align-items:flex-start; }
        .up-theme-workflow-label { display:block; color:#898a86; font-size:9px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px; }
        .up-theme-workflow-card-head strong { display:block; font-size:18px; }
        .up-theme-workflow-status { padding:4px 7px; font-size:8px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
        .up-theme-workflow-status.draft { background:#fff1c9; color:#916b00; }
        .up-theme-workflow-status.published { background:#def4e8; color:#167243; }
        .up-theme-workflow-swatches { display:grid; grid-template-columns:repeat(6,1fr); gap:4px; margin:18px 0 12px; }
        .up-theme-workflow-swatches span { height:30px; border:1px solid rgba(0,0,0,.1); }
        .up-theme-workflow-meta,.up-theme-workflow-empty { color:#8b8c87; font-size:10px; line-height:1.5; }
        .up-theme-workflow-actions { background:#fff; border:1px solid #e3e2dc; padding:16px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .up-theme-workflow-actions button,.up-theme-workflow-actions a { display:inline-flex; align-items:center; gap:7px; border:1px solid #dddcd5; background:#fff; color:#333; padding:11px 14px; font-size:9px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; text-decoration:none; }
        .up-theme-workflow-actions button.accent { background:#f2a900; color:#111; border-color:#f2a900; }
        .up-theme-workflow-actions button.danger { color:#a32727; }
        .up-theme-workflow-actions button:disabled { opacity:.45; cursor:not-allowed; }
        .up-theme-workflow-note { margin-left:auto; color:#777; font-size:10px; }
        .up-theme-workflow-feedback { padding:11px 14px; background:#fff; border:1px solid #e3e2dc; font-size:11px; }
        .up-theme-workflow-feedback.success { color:#2c5745; } .up-theme-workflow-feedback.error { color:#a32727; }
        @media (max-width:760px) { .up-theme-workflow-grid { grid-template-columns:1fr; } .up-theme-workflow-header { align-items:flex-start; flex-direction:column; } .up-theme-workflow-note { width:100%; margin-left:0; } }
      `}</style>

      <header className="up-theme-workflow-header">
        <div>
          <div className="up-theme-workflow-kicker">APPEARANCE / WORKFLOW</div>
          <h1>Theme Workflow</h1>
          <p>Draft, preview and publish safely. Editing the theme never changes the public website until Publish.</p>
        </div>
        <Link to="/admin/appearance" className="up-theme-workflow-back">← Back to Appearance</Link>
      </header>

      <div className="up-theme-workflow-statusbar">
        <span className="up-theme-workflow-dot" />
        <strong>{draft ? "Draft changes ready" : "Published theme is current"}</strong>
        <span>{draft ? "Review the draft before publishing." : "No pending theme changes."}</span>
        <button type="button" onClick={() => void refresh()} disabled={loading || busy} aria-label="Refresh theme workflow"><RefreshCw size={13} /></button>
      </div>

      <section className="up-theme-workflow-grid">
        <ThemeCard title="Published" record={published} />
        <ThemeCard title="Draft" record={draft} muted />
      </section>

      <section className="up-theme-workflow-actions">
        <Link to="/admin/appearance"><Pencil size={13} /> Edit Theme</Link>
        <button type="button" onClick={() => void run(() => saveThemeToDatabase(getStoredTheme()), "Current editor state saved as draft.")} disabled={busy}><Save size={13} /> Save Draft</button>
        <button type="button" onClick={() => void openThemePreview(draft?.theme_data ?? getStoredTheme())} disabled={busy}><Eye size={13} /> Preview</button>
        <button type="button" className="accent" onClick={() => void run(() => publishTheme(), "Draft published. Public website now uses the new theme.")} disabled={busy || !draft}><Send size={13} /> Publish</button>
        <button type="button" onClick={() => void run(() => resetTheme(), "Draft reset to the default WEARO palette.")} disabled={busy}><RotateCcw size={13} /> Reset Draft</button>
        <button type="button" className="danger" onClick={() => { if (window.confirm("Discard the saved draft? The published theme will not change.")) void run(() => discardThemeDraft(), "Saved draft discarded. Published theme is unchanged."); }} disabled={busy || !draft}><Trash2 size={13} /> Discard</button>
        <span className="up-theme-workflow-note">Published changes are separate from drafts.</span>
      </section>

      {message && <div className="up-theme-workflow-feedback success">✓ {message}</div>}
      {error && <div className="up-theme-workflow-feedback error">{error}</div>}
    </div>
  );
}
