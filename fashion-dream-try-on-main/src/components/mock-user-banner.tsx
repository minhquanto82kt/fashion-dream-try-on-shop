import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { exitMockUserMode, isMockUserMode, MOCK_USER_MODE_EVENT } from "../lib/mock-user";

export function MockUserBanner() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isMockUserMode());
    const sync = () => setActive(isMockUserMode());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isMockUserMode()) return;
      event.preventDefault();
      exitMockUserMode();
      void navigate({ to: "/admin" });
    };
    window.addEventListener(MOCK_USER_MODE_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(MOCK_USER_MODE_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navigate]);

  if (!active) return null;

  const escape = () => {
    exitMockUserMode();
    void navigate({ to: "/admin" });
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex min-h-10 items-center justify-between gap-4 border-b bg-background px-4 py-2 text-sm shadow-sm" role="status" aria-label="Mock User preview mode">
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true">🧪</span>
        <strong>MOCK USER MODE</strong>
        <span className="hidden truncate sm:inline">You're previewing WEARO as a customer.</span>
      </div>
      <button type="button" onClick={escape} className="shrink-0 rounded-md border px-3 py-1.5 font-medium transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" aria-label="Exit Mock User mode and return to Admin Dashboard">
        ⎋ Escape
      </button>
    </div>
  );
}
