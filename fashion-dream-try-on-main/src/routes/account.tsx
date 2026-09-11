import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LogIn, LogOut, UserRound, UserPlus } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  getSession,
  getUser,
  setSession,
  signIn,
  signOut,
  type Session,
} from "@/lib/upthink-supabase";
import { signUp } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Tài khoản | UpThink" },
      {
        name: "description",
        content: "Đăng nhập hoặc tạo tài khoản UpThink.",
      },
    ],
  }),
  component: AccountPage,
});

type Mode = "signin" | "signup";

type User = { id: string; email?: string };

function AccountPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [session, setLocalSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      const currentSession = getSession();

      if (!currentSession) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const currentUser = await getUser();
        if (!cancelled) {
          setLocalSession(currentSession);
          setUser(currentUser);
        }
      } catch {
        setSession(null);
        if (!cancelled) setLocalSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    try {
      if (!email || !password) {
        throw new Error("Vui lòng nhập email và mật khẩu.");
      }

      if (mode === "signup") {
        if (password.length < 6) {
          throw new Error("Mật khẩu cần ít nhất 6 ký tự.");
        }

        if (password !== confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp.");
        }

        const result = await signUp(email, password);

        if (result.access_token) {
          setLocalSession(result as Session);
          setUser(result.user ?? null);
          setMessage("Tạo tài khoản thành công.");
        } else {
          setMode("signin");
          setMessage(
            "Tài khoản đã được tạo. Hãy kiểm tra email để xác nhận trước khi đăng nhập."
          );
        }
      } else {
        const result = await signIn(email, password);
        setLocalSession(result);
        setUser(result.user ?? null);
        setMessage("Đăng nhập thành công.");
      }

      event.currentTarget.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể xử lý tài khoản."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    await signOut();
    setLocalSession(null);
    setUser(null);
    setMessage("Bạn đã đăng xuất.");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-primary text-primary">
              <UserRound size={18} />
            </div>
            <div>
              <p className="eyebrow">UpThink Account</p>
              <h1 className="mt-1 text-3xl leading-none sm:text-4xl">
                Tài khoản<span className="text-primary">.</span>
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="border border-border bg-card p-6 text-sm text-silver">
              Đang kiểm tra phiên đăng nhập...
            </div>
          ) : session && user ? (
            <div className="border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-silver">
                Đang đăng nhập
              </p>
              <p className="mt-3 break-words text-lg text-beige">
                {user.email || "Tài khoản UpThink"}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/shop"
                  className="inline-flex min-h-11 items-center justify-center border border-border px-5 py-3 text-xs uppercase tracking-[0.15em] text-beige hover:border-primary"
                >
                  Tiếp tục mua sắm
                </Link>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleSignOut()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary px-5 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
                >
                  <LogOut size={14} />
                  {submitting ? "Đang xử lý..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-card p-6 sm:p-8">
              <div className="grid grid-cols-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setMessage("");
                  }}
                  className={`border-b-2 px-3 py-3 text-xs uppercase tracking-[0.15em] ${
                    mode === "signin"
                      ? "border-primary text-primary"
                      : "border-transparent text-silver"
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setMessage("");
                  }}
                  className={`border-b-2 px-3 py-3 text-xs uppercase tracking-[0.15em] ${
                    mode === "signup"
                      ? "border-primary text-primary"
                      : "border-transparent text-silver"
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-silver">
                    Email
                  </span>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="mt-2 min-h-11 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-silver">
                    Mật khẩu
                  </span>
                  <input
                    required
                    name="password"
                    type="password"
                    minLength={6}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    className="mt-2 min-h-11 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </label>

                {mode === "signup" && (
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-silver">
                      Xác nhận mật khẩu
                    </span>
                    <input
                      required
                      name="confirmPassword"
                      type="password"
                      minLength={6}
                      autoComplete="new-password"
                      className="mt-2 min-h-11 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="••••••••"
                    />
                  </label>
                )}

                {error && (
                  <p className="border border-red-500/40 bg-red-500/5 p-3 text-sm leading-6 text-red-300">
                    {error}
                  </p>
                )}

                {message && (
                  <p className="border border-primary/40 bg-primary/5 p-3 text-sm leading-6 text-primary">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
                >
                  {mode === "signin" ? <LogIn size={14} /> : <UserPlus size={14} />}
                  {submitting
                    ? "Đang xử lý..."
                    : mode === "signin"
                      ? "Đăng nhập"
                      : "Tạo tài khoản"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
