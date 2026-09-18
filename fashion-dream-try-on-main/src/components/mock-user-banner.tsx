import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { exitMockUserMode, isMockUserPreviewActive } from "@/lib/mock-user";

export function MockUserBanner() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(isMockUserPreviewActive());
    sync();
    window.addEventListener("wearo:mock-user:changed", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("wearo:mock-user:changed", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitMockUserMode();
        void navigate({ to: "/admin" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, navigate]);

  if (!active) return null;

  const escape = () => {
    exitMockUserMode();
    void navigate({ to: "/admin" });
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex min-h-10 items-center justify-between gap-4 border-b border-border bg-background px-4 py-2 text-sm shadow-sm" role="status" aria-label="Mock User preview mode">
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true">🧪</span>
        <strong>MOCK USER MODE</strong>
        <span className="hidden truncate text-muted-foreground sm:inline">Đang xem WEARO như một khách hàng.</span>
      </div>
      <button type="button" onClick={escape} className="shrink-0 rounded-md border border-border px-3 py-1.5 font-medium transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" aria-label="Thoát Mock User và quay về Admin Dashboard">
        ⎋ Escape
      </button>
    </div>
  );
}
