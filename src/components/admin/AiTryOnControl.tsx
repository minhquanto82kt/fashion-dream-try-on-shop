import { useEffect, useState } from "react";
import { getSession } from "@/lib/upthink-supabase";

export function AiTryOnControl() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [environment, setEnvironment] = useState("preview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadFlag(targetEnvironment = environment) {
    setLoading(true);
    setError("");

    try {
      const session = getSession();
      if (!session?.access_token) {
        throw new Error("Phiên admin đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const response = await fetch(
        `/api/admin/ai-try-on?environment=${encodeURIComponent(targetEnvironment)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = (await response.json()) as {
        enabled?: boolean;
        error?: string;
      };

      if (!response.ok || typeof data.enabled !== "boolean") {
        throw new Error(data.error || "Không thể đọc trạng thái AI Try-On.");
      }

      setEnabled(data.enabled);
    } catch (err) {
      setEnabled(null);
      setError(err instanceof Error ? err.message : "Không thể đọc trạng thái.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFlag();
  }, [environment]);

  async function toggleFlag() {
    if (enabled === null || saving) return;

    setSaving(true);
    setError("");

    try {
      const session = getSession();
      if (!session?.access_token) {
        throw new Error("Phiên admin đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const response = await fetch("/api/admin/ai-try-on", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          environment,
          enabled: !enabled,
        }),
      });

      const data = (await response.json()) as {
        enabled?: boolean;
        error?: string;
      };

      if (!response.ok || typeof data.enabled !== "boolean") {
        throw new Error(data.error || "Không thể cập nhật AI Try-On.");
      }

      setEnabled(data.enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="up-admin-dashboard-section" aria-labelledby="ai-try-on-control-title">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div className="up-admin-kicker">AI / FEATURE CONTROL</div>
          <h2 id="ai-try-on-control-title">AI TRY-ON (BETA)</h2>
          <p>Kill switch cho AI Try-On bằng Vercel Flags, không cần redeploy.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="ai-try-on-environment" style={{ fontSize: 12 }}>
            Environment
          </label>
          <select
            id="ai-try-on-environment"
            value={environment}
            onChange={(event) => setEnvironment(event.target.value)}
            disabled={loading || saving}
            style={{ minHeight: 40, padding: "0 12px" }}
          >
            <option value="preview">Preview</option>
            <option value="production">Production</option>
            <option value="development">Development</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 24, padding: 20, border: "1px solid rgba(17,16,15,.14)" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Current status</div>
          <strong style={{ display: "block", marginTop: 6, fontSize: 24 }}>
            {loading ? "Checking…" : enabled === null ? "Unavailable" : enabled ? "ON" : "OFF"}
          </strong>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.55 }}>
            {environment.toUpperCase()} · ai_try_on
          </div>
        </div>

        <button
          type="button"
          onClick={() => void toggleFlag()}
          disabled={loading || saving || enabled === null}
          aria-pressed={enabled ?? false}
          style={{
            minWidth: 128,
            minHeight: 48,
            border: 0,
            borderRadius: 999,
            cursor: loading || saving || enabled === null ? "not-allowed" : "pointer",
            background: enabled ? "#11100f" : "#d9d4cd",
            color: enabled ? "#d7ff3f" : "#11100f",
            opacity: loading || saving || enabled === null ? 0.55 : 1,
            fontWeight: 700,
            letterSpacing: ".08em",
          }}
        >
          {saving ? "SAVING…" : enabled ? "TURN OFF" : "TURN ON"}
        </button>
      </div>

      {error ? (
        <p role="alert" style={{ marginTop: 14, color: "#a33b2b", fontSize: 12 }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}
