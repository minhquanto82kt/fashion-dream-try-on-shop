import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, LogIn, LogOut, UserPlus, UserRound } from "lucide-react";
import {
  getCustomerUser,
  signInCustomer,
  signOutCustomer,
  signUpCustomer,
} from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Tài khoản | UpThink" },
      {
        name: "description",
        content: "Đăng nhập hoặc tạo tài khoản mua hàng UpThink.",
      },
    ],
  }),
  component: AccountPage,
});

type Mode = "signin" | "signup";
type User = { id: string; email?: string };

const BACKGROUND_IMAGE = "/account/account-background.png";
const FOREGROUND_IMAGE = "/account/account-people-cutout.png";

function AccountPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void getCustomerUser()
      .then(setUser)
      .finally(() => setLoading(false));
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
      if (!email || !password) throw new Error("Vui lòng nhập email và mật khẩu.");
      if (password.length < 6) throw new Error("Mật khẩu cần ít nhất 6 ký tự.");

      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp.");
        }

        const result = await signUpCustomer(email, password);
        if (result.access_token) {
          setUser(result.user ?? null);
          setMessage("Tạo tài khoản mua hàng thành công.");
        } else {
          setMode("signin");
          setMessage(
            "Tài khoản mua hàng đã được tạo. Hãy kiểm tra email để xác nhận trước khi đăng nhập."
          );
        }
      } else {
        const result = await signInCustomer(email, password);
        setUser(result.user ?? null);
        setMessage("Đăng nhập tài khoản mua hàng thành công.");
      }

      event.currentTarget.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể xử lý tài khoản mua hàng."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    await signOutCustomer();
    setUser(null);
    setMessage("Bạn đã đăng xuất tài khoản mua hàng.");
    setSubmitting(false);
  };

  return (
    <main className="account-page">
      <div className="account-canvas" aria-label="UpThink Customer Account">
        <div
          className="account-layer account-layer-background"
          aria-hidden="true"
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
        />

        <div className="account-layer account-layer-content">
          <Link to="/" className="account-home-link">
            <ArrowLeft size={15} strokeWidth={1.8} />
            <span>Quay về trang chủ</span>
          </Link>

          <div className="account-branding">
            <p className="account-eyebrow">UpThink Customer Account</p>
            <h1>
              Tài khoản<span>.</span>
            </h1>
          </div>
        </div>

        <div
          className="account-layer account-layer-foreground"
          aria-hidden="true"
          style={{ backgroundImage: `url(${FOREGROUND_IMAGE})` }}
        />

        <div className="account-interaction">
          {loading ? (
            <div className="account-status">Đang kiểm tra phiên tài khoản mua hàng...</div>
          ) : user ? (
            <div className="account-authenticated">
              <p className="account-form-kicker">Customer session / active</p>
              <p className="account-user-email">{user.email || "Tài khoản UpThink"}</p>
              <p className="account-helper">
                Bạn đang đăng nhập bằng tài khoản mua hàng. Khu vực quản trị sử dụng cổng Admin riêng.
              </p>
              <div className="account-actions">
                <Link to="/shop" className="account-secondary-action">
                  Tiếp tục mua sắm
                  <ArrowUpRight size={15} />
                </Link>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleSignOut()}
                  className="account-primary-action"
                >
                  <LogOut size={14} />
                  {submitting ? "Đang xử lý..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          ) : (
            <section className="account-form-panel" aria-label="Customer account form">
              <div className="account-form-heading">
                <div className="account-form-icon" aria-hidden="true">
                  <UserRound size={16} strokeWidth={1.6} />
                </div>
                <div>
                  <p className="account-form-kicker">Customer access</p>
                  <p className="account-form-title">
                    {mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
                  </p>
                </div>
              </div>

              <div className="account-tabs" role="tablist" aria-label="Account mode">
                {(["signin", "signup"] as const).map((value, index) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    onClick={() => {
                      setMode(value);
                      setError("");
                      setMessage("");
                    }}
                    className={mode === value ? "active" : ""}
                  >
                    <span className="account-tab-index">0{index + 1}</span>
                    {value === "signin" ? "Đăng nhập" : "Đăng ký"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="account-form">
                <label>
                  <span>Email</span>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  <span>Mật khẩu</span>
                  <input
                    required
                    name="password"
                    type="password"
                    minLength={6}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                  />
                </label>

                {mode === "signup" && (
                  <label className="account-confirm-field">
                    <span>Xác nhận mật khẩu</span>
                    <input
                      required
                      name="confirmPassword"
                      type="password"
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="••••••••"
                    />
                  </label>
                )}

                {error && <p className="account-feedback error">{error}</p>}
                {message && <p className="account-feedback success">{message}</p>}

                <button type="submit" disabled={submitting} className="account-submit">
                  <span>
                    {submitting
                      ? "Đang xử lý..."
                      : mode === "signin"
                        ? "Đăng nhập"
                        : "Tạo tài khoản"}
                  </span>
                  {mode === "signin" ? <LogIn size={14} /> : <UserPlus size={14} />}
                  <ArrowUpRight className="account-submit-arrow" size={14} />
                </button>
              </form>
            </section>
          )}
        </div>

        <div className="account-info-gradient">
          <div>
            <strong>UPTHINK</strong>
            <p>
              Một ý tưởng khởi nghiệp của sinh viên IUH: thời trang cá nhân hóa với AI concept và virtual try-on.
            </p>
          </div>
          <small>© 2026 UpThink — Đại học Công nghiệp TP.HCM / IUH</small>
        </div>
      </div>

      <style>{`
        .account-page {
          min-height: 100svh;
          width: 100%;
          overflow-x: hidden;
          background: #1b1a17;
          color: #f4ead8;
        }

        .account-canvas {
          position: relative;
          min-height: 100svh;
          isolation: isolate;
          overflow: hidden;
          background: #1b1a17;
        }

        .account-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .account-layer-background,
        .account-layer-foreground {
          background-position: center top;
          background-repeat: no-repeat;
          background-size: cover;
        }

        .account-layer-background {
          z-index: 0;
        }

        .account-layer-content {
          z-index: 10;
        }

        .account-layer-foreground {
          z-index: 20;
          opacity: 0;
          animation: accountForegroundReveal 1.15s cubic-bezier(.22, 1, .36, 1) .15s forwards;
        }

        .account-home-link {
          position: absolute;
          left: clamp(24px, 4vw, 64px);
          top: clamp(22px, 4vw, 48px);
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #f4ead8;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: opacity .2s ease, transform .2s ease;
          animation: accountFadeUp .7s ease-out .2s both;
        }

        .account-home-link:hover {
          opacity: .72;
          transform: translateX(-3px);
        }

        .account-branding {
          position: absolute;
          left: clamp(24px, 8vw, 128px);
          top: clamp(92px, 16vh, 168px);
          max-width: 360px;
          animation: accountBrandReveal .9s cubic-bezier(.22, 1, .36, 1) .35s both;
        }

        .account-eyebrow,
        .account-form-kicker {
          margin: 0;
          color: #f0a500;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .account-branding h1 {
          margin: 10px 0 0;
          font-size: clamp(42px, 6vw, 86px);
          font-weight: 500;
          letter-spacing: -.055em;
          line-height: .92;
        }

        .account-branding h1 span {
          color: #f0a500;
        }

        .account-interaction {
          position: relative;
          z-index: 30;
          display: flex;
          min-height: 100svh;
          align-items: center;
          justify-content: flex-end;
          padding: 120px clamp(24px, 8vw, 128px) 180px;
          pointer-events: none;
        }

        .account-form-panel,
        .account-authenticated,
        .account-status {
          width: min(100%, 390px);
          pointer-events: auto;
        }

        .account-form-panel,
        .account-authenticated {
          padding: 24px 0;
          background: linear-gradient(90deg, rgba(27, 26, 23, .08), rgba(27, 26, 23, .48) 38%, rgba(27, 26, 23, .7));
          animation: accountFormReveal .85s cubic-bezier(.22, 1, .36, 1) .5s both;
        }

        .account-form-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .account-form-icon {
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          border: 1px solid rgba(240, 165, 0, .65);
          color: #f0a500;
          transition: transform .25s ease, background-color .25s ease;
        }

        .account-form-heading:hover .account-form-icon {
          transform: rotate(-4deg);
          background: rgba(240, 165, 0, .08);
        }

        .account-form-title {
          margin: 3px 0 0;
          color: #f4ead8;
          font-size: 19px;
          letter-spacing: -.025em;
        }

        .account-tabs {
          display: flex;
          gap: 22px;
          margin-bottom: 22px;
          border-bottom: 1px solid rgba(240, 213, 184, .22);
        }

        .account-tabs button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 0 11px;
          border: 0;
          background: transparent;
          color: rgba(244, 234, 216, .45);
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
          transition: color .2s ease, transform .2s ease;
        }

        .account-tabs button:hover {
          color: rgba(244, 234, 216, .78);
          transform: translateY(-1px);
        }

        .account-tabs button.active {
          color: #f0a500;
        }

        .account-tabs button.active::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          background: #f0a500;
          content: "";
          animation: accountTabLine .25s ease-out both;
        }

        .account-tab-index {
          font-size: 7px;
          letter-spacing: .08em;
          opacity: .65;
        }

        .account-form {
          display: grid;
          gap: 18px;
        }

        .account-form label {
          display: grid;
          gap: 7px;
        }

        .account-form label span {
          color: rgba(244, 234, 216, .72);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .account-form input {
          width: 100%;
          min-height: 42px;
          padding: 7px 0 10px;
          border: 0;
          border-bottom: 1px solid rgba(244, 234, 216, .35);
          outline: none;
          background: transparent;
          color: #f4ead8;
          font: inherit;
          font-size: 14px;
          transition: border-color .2s ease, padding-left .2s ease;
          box-sizing: border-box;
        }

        .account-form input::placeholder {
          color: rgba(244, 234, 216, .3);
        }

        .account-form input:focus {
          border-bottom-color: #f0a500;
          padding-left: 5px;
        }

        .account-form input:-webkit-autofill,
        .account-form input:-webkit-autofill:hover,
        .account-form input:-webkit-autofill:focus {
          -webkit-text-fill-color: #f4ead8;
          -webkit-box-shadow: 0 0 0 1000px rgba(27, 26, 23, .96) inset;
          box-shadow: 0 0 0 1000px rgba(27, 26, 23, .96) inset;
          caret-color: #f4ead8;
          transition: background-color 9999s ease-out;
        }

        .account-feedback {
          margin: 0;
          padding: 10px 0;
          font-size: 11px;
          line-height: 1.55;
        }

        .account-feedback.error {
          color: #ff9d86;
        }

        .account-feedback.success {
          color: #f0a500;
        }

        .account-submit,
        .account-primary-action {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          background: #f0a500;
          color: #1b1a17;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .17em;
          text-transform: uppercase;
          transition: transform .2s ease, opacity .2s ease, letter-spacing .2s ease;
        }

        .account-submit {
          width: 100%;
          margin-top: 4px;
        }

        .account-submit-arrow {
          transition: transform .2s ease;
        }

        .account-submit:hover:not(:disabled),
        .account-primary-action:hover:not(:disabled) {
          transform: translateY(-2px);
          letter-spacing: .2em;
        }

        .account-submit:hover:not(:disabled) .account-submit-arrow {
          transform: translate(2px, -2px);
        }

        .account-submit:disabled,
        .account-primary-action:disabled {
          cursor: not-allowed;
          opacity: .5;
        }

        .account-status {
          padding: 14px 0;
          color: #f4ead8;
          font-size: 11px;
        }

        .account-authenticated {
          padding-top: 32px;
          padding-bottom: 32px;
        }

        .account-user-email {
          margin: 8px 0 10px;
          color: #f4ead8;
          font-size: 22px;
          letter-spacing: -.025em;
          overflow-wrap: anywhere;
        }

        .account-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 22px;
        }

        .account-secondary-action {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #f4ead8;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
          text-decoration: none;
          text-transform: uppercase;
          transition: opacity .2s ease, transform .2s ease;
        }

        .account-secondary-action:hover {
          opacity: .72;
          transform: translateX(2px);
        }

        .account-info-gradient {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 40;
          display: flex;
          min-height: 132px;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding: 42px clamp(24px, 4vw, 64px) 24px;
          background: linear-gradient(to top, rgba(5, 7, 19, .96), rgba(5, 7, 19, .7) 55%, transparent);
          pointer-events: none;
          animation: accountInfoReveal .9s ease-out .75s both;
        }

        .account-info-gradient strong {
          display: block;
          color: #f0a500;
          font-size: 12px;
          letter-spacing: .18em;
        }

        .account-info-gradient p {
          max-width: 440px;
          margin: 7px 0 0;
          color: rgba(244, 234, 216, .78);
          font-size: 10px;
          line-height: 1.6;
        }

        .account-info-gradient small {
          color: rgba(244, 234, 216, .62);
          font-size: 9px;
          white-space: nowrap;
        }

        @keyframes accountForegroundReveal {
          from { opacity: 0; clip-path: inset(0 0 0 2%); }
          to { opacity: 1; clip-path: inset(0); }
        }

        @keyframes accountFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes accountBrandReveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes accountFormReveal {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes accountInfoReveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes accountTabLine {
          from { transform: scaleX(.35); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }

        @media (max-width: 900px) {
          .account-layer-background,
          .account-layer-foreground {
            background-position: 56% top;
          }

          .account-branding {
            left: 28px;
            top: 100px;
          }

          .account-interaction {
            align-items: flex-end;
            justify-content: center;
            padding: 180px 28px 150px;
          }

          .account-form-panel,
          .account-authenticated {
            width: min(100%, 470px);
          }
        }

        @media (max-width: 640px) {
          .account-layer-background,
          .account-layer-foreground {
            background-size: auto 72svh;
            background-position: 57% 0;
          }

          .account-branding {
            top: 86px;
          }

          .account-branding h1 {
            font-size: 48px;
          }

          .account-interaction {
            min-height: 100svh;
            padding: 270px 24px 145px;
          }

          .account-form-panel,
          .account-authenticated {
            padding: 20px 0;
            background: linear-gradient(90deg, rgba(27, 26, 23, .22), rgba(27, 26, 23, .82));
          }

          .account-info-gradient {
            display: block;
            min-height: 120px;
            padding: 42px 24px 18px;
          }

          .account-info-gradient small {
            display: block;
            margin-top: 9px;
            white-space: normal;
          }

          .account-actions {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .account-layer-foreground,
          .account-home-link,
          .account-branding,
          .account-form-panel,
          .account-authenticated,
          .account-info-gradient {
            animation: none;
            opacity: 1;
            transform: none;
            clip-path: none;
          }

          .account-home-link,
          .account-submit,
          .account-primary-action,
          .account-secondary-action,
          .account-form-icon,
          .account-form input,
          .account-tabs button {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
