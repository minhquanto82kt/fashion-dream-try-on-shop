import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { exitMockUserMode, isMockUserMode } from "../lib/mock-user";

export function MockUserBanner() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isMockUserMode());
    const onStorage = () => setActive(isMockUserMode());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!active) return null;

  const escape = () => {
    exitMockUserMode();
    setActive(false);
    void navigate({ to: "/admin" });
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex min-h-10 items-center justify-between gap-4 border-b bg-background px-4 py-2 text-sm shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true">🧪</span>
        <strong>MOCK USER MODE</strong>
        <span className="hidden truncate sm:inline">You're previewing WEARO as a customer.</span>
      </div>
      <button type="button" onClick={escape} className="shrink-0 rounded-md border px-3 py-1.5 font-medium transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
        ⎋ Escape
      </button>
    </div>
  );
}
