import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/ai-studio")({
  component: AdminAiStudioPage,
  head: () => ({ meta: [{ title: "AI Studio — Admin — UpThink" }] }),
});

function AdminAiStudioPage() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const toggle = async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/ai-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled, environment: "preview" }),
      });
      const data = (await response.json()) as { enabled?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "Không thể cập nhật AI Try-On.");
      setEnabled(Boolean(data.enabled));
      setMessage(Boolean(data.enabled) ? "AI Try-On đã bật." : "AI Try-On đã tắt.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật AI Try-On.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">ADMIN / AI STUDIO</div>
          <h1>AI Studio</h1>
          <p>Kiểm soát và kiểm thử Virtual Try-On trước khi mở cho khách hàng.</p>
        </div>
        <Link to="/ai" className="up-admin-secondary" style={{ textDecoration: "none" }}>
          Open AI Studio ↗
        </Link>
      </header>

      <section className="up-admin-dashboard-section">
        <h2>AI TRY-ON (BETA)</h2>
        <p>Feature flag: <strong>ai_try_on</strong> · Preview environment</p>
        <div className="up-admin-dashboard-action" style={{ marginTop: 20, maxWidth: 560 }}>
          <div className="up-admin-dashboard-action-title">
            {enabled ? "AI Try-On is ON" : "AI Try-On is OFF"}
          </div>
          <div className="up-admin-dashboard-action-desc">
            {enabled
              ? "Route /ai được phép chạy Virtual Try-On."
              : "Virtual Try-On sẽ bị khóa ở server khi feature flag tắt."}
          </div>
          <button
            type="button"
            onClick={toggle}
            disabled={busy}
            className="up-admin-secondary"
            style={{ marginTop: 16, cursor: busy ? "wait" : "pointer" }}
          >
            {busy ? "Updating…" : enabled ? "TURN OFF" : "TURN ON"}
          </button>
          {message && <div className="up-admin-dashboard-muted" style={{ marginTop: 12 }}>{message}</div>}
        </div>
      </section>
    </>
  );
}
