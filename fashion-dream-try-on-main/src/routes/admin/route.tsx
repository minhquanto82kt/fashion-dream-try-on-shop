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
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
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
