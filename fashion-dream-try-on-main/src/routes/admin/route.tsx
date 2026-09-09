import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { checkAdmin, getSession, signIn, signOut, supabaseConfig } from "@/lib/upthink-supabase";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — UpThink" }] }),
});

function AdminLayout() {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function verifySession() {
    setReady(false);
    setLoginError("");
    try {
      if (!supabaseConfig.url || !supabaseConfig.key || !getSession()) {
        setAuthorized(false);
        return;
      }

      setAuthorized(Boolean(await checkAdmin()));
    } catch (error) {
      setAuthorized(false);
      setLoginError(error instanceof Error ? error.message : "Không thể xác thực admin.");
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    void verifySession();
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      await signIn(loginEmail.trim(), loginPassword);
      const isAdmin = await checkAdmin();

      if (!isAdmin) {
        await signOut();
        throw new Error(
          "Tài khoản đăng nhập thành công nhưng chưa được cấp quyền Admin. Hãy kiểm tra user_id trong bảng admin_users."
        );
      }

      setAuthorized(true);
      setLoginPassword("");
    } catch (error) {
      setAuthorized(false);
      setLoginError(error instanceof Error ? error.message : "Đăng nhập thất bại.");
    } finally {
      setLoggingIn(false);
      setReady(true);
    }
  }

  if (!ready) {
    return <div className="up-admin-loading">Đang xác thực tài khoản admin…</div>;
  }

  if (!authorized) {
    return (
      <div className="up-admin-login">
        <div className="up-admin-login-card">
          <div className="up-admin-brand">
            UPTHINK<span>COMMERCE ADMIN</span>
          </div>
          <h1>Đăng nhập quản trị</h1>
          <p>
            Đăng nhập bằng tài khoản Supabase Auth đã được cấp quyền trong bảng
            <code> admin_users</code>.
          </p>
          <form onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                required
              />
            </label>
            <label>
              Mật khẩu
              <div className="up-admin-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="up-admin-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.2 0 10 7 10 7a18 18 0 0 1-3.1 3.8" />
                      <path d="M6.1 6.1C3.7 7.7 2 12 2 12s3.8 7 10 7a10.7 10.7 0 0 0 4-.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
            {loginError && <div className="up-admin-error">{loginError}</div>}
            <button className="up-admin-primary" type="submit" disabled={loggingIn}>
              {loggingIn ? "ĐANG XÁC THỰC…" : "ĐĂNG NHẬP →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminShell />;
}
