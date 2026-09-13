import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/admin/ai-studio")({
  component: AdminAiStudioPage,
  head: () => ({ meta: [{ title: "AI Studio — Admin — UpThink" }] }),
});

type Environment = "preview" | "production" | "development";

function AdminAiStudioPage() {
  const [environment, setEnvironment] = useState<Environment>("preview");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("Đang đọc trạng thái feature flag…");

  const load = async (target: Environment) => {
    setBusy(true);
    setMessage("Đang đồng bộ…");
    try {
      const session = getSession();
      const response = await fetch(`/api/admin/ai-try-on?environment=${target}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const data = (await response.json()) as { enabled?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "Không thể đọc trạng thái AI Try-On.");
      setEnabled(Boolean(data.enabled));
      setMessage("Đã đồng bộ với Vercel Flags.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đọc trạng thái AI Try-On.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load(environment);
  }, [environment]);

  const toggle = async () => {
    setBusy(true);
    setMessage("Đang cập nhật feature flag…");
    try {
      const session = getSession();
      const response = await fetch("/api/admin/ai-try-on", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ enabled: !enabled, environment }),
      });
      const data = (await response.json()) as { enabled?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "Không thể cập nhật AI Try-On.");
      setEnabled(Boolean(data.enabled));
      setMessage(Boolean(data.enabled) ? "AI Try-On đã BẬT." : "AI Try-On đã TẮT.");
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
          <p>Điều khiển Virtual Try-On và kiểm tra feature flag trước khi mở cho khách hàng.</p>
        </div>
        <Link to="/ai" className="up-admin-secondary" style={{ textDecoration: "none" }}>
          Open AI Studio ↗
        </Link>
      </header>
      <section className="up-admin-dashboard-section">
        <h2>AI TRY-ON (BETA)</h2>
        <p>Feature flag: <strong>ai_try_on</strong></p>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          {(["preview", "production", "development"] as Environment[]).map((item) => (
            <button key={item} type="button" onClick={() => setEnvironment(item)} className="up-secondary" aria-pressed={environment === item} style={environment === item ? { borderColor: "#f2a900", background: "#fff7df" } : undefined}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="up-admin-dashboard-action" style={{ marginTop: 20, maxWidth: 620 }}>
          <div className="up-admin-dashboard-action-title">{enabled ? "● AI Try-On is ON" : "○ AI Try-On is OFF"}</div>
          <div className="up-admin-dashboard-action-desc">{enabled ? `Environment ${environment}: /ai được phép chạy Virtual Try-On.` : `Environment ${environment}: server sẽ từ chối yêu cầu Virtual Try-On.`}</div>
          <button type="button" onClick={() => void toggle()} disabled={busy} className="up-admin-primary" style={{ marginTop: 8 }}>
            {busy ? "UPDATING…" : enabled ? "TURN OFF" : "TURN ON"}
          </button>
          <div className="up-admin-dashboard-muted" style={{ marginTop: 12 }}>{message}</div>
        </div>
      </section>
    </>
  );
}
