import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { signInCustomer, signUpCustomer } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

type Mode = "login" | "register";

function AccountPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp.");
        }
        await signUpCustomer(email, password);
        setMessage("Đăng ký thành công. Kiểm tra email nếu cần xác nhận tài khoản.");
      } else {
        await signInCustomer(email, password);
        setMessage("Đăng nhập thành công.");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Đã xảy ra lỗi. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="account-page">
      <style>{`
        :root:has(.account-page),
        body:has(.account-page) {
          margin: 0;
          overflow: hidden;
        }

        .account-page {
          --cream: #e6d5b8;
          --yellow: #f0a500;
          --orange: #e45826;
          --ink: #1b1a17;
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          isolation: isolate;
          background: var(--ink);
          color: var(--cream);
          font-family: inherit;
        }

        .account-page * {
          box-sizing: border-box;
        }

        /* One clean background layer. cover preserves the models' proportions. */
        .account-background {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          pointer-events: none;
          user-select: none;
        }

        .account-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(10,8,6,.68) 0%, rgba(10,8,6,.34) 26%, rgba(10,8,6,.18) 50%, rgba(10,8,6,.48) 100%),
            linear-gradient(180deg, rgba(10,8,6,.28) 0%, rgba(10,8,6,.08) 43%, rgba(10,8,6,.72) 100%);
        }

        .account-noise {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: .045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E");
        }

        .account-content {
          position: relative;
          z-index: 10;
          width: min(1180px, calc(100vw - 80px));
          height: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-rows: auto 1fr auto;
          padding: 34px 0 30px;
        }

        .account-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .account-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: rgba(230,213,184,.82);
          text-decoration: none;
          text-transform: uppercase;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .16em;
          transition: color .2s ease, transform .2s ease;
        }

        .account-back:hover {
          color: var(--yellow);
          transform: translateX(-3px);
        }

        .account-logo {
          color: var(--yellow);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .28em;
          text-transform: uppercase;
        }

        .account-main {
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .account-composition {
          position: relative;
          width: min(1040px, 100%);
          display: grid;
          grid-template-columns: minmax(360px, .95fr) minmax(440px, 1.05fr);
          gap: clamp(34px, 5vw, 76px);
          align-items: center;
        }

        .account-intro {
          position: relative;
          padding: 12px 0 22px;
          animation: accountIntroIn .75s cubic-bezier(.2,.75,.25,1) both;
        }

        .account-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: var(--yellow);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .account-eyebrow::before {
          content: "";
          width: 38px;
          height: 1px;
          background: var(--yellow);
        }

        .account-title {
          max-width: 610px;
          margin: 0;
          color: var(--cream);
          font-size: clamp(54px, 7vw, 104px);
          line-height: .86;
          font-weight: 900;
          letter-spacing: -.025em;
          text-transform: uppercase;
          text-shadow: 0 10px 32px rgba(0,0,0,.35);
        }

        .account-title span {
          display: block;
        }

        .account-title .account-title-accent {
          color: var(--yellow);
        }

        .account-copy {
          max-width: 390px;
          margin: 26px 0 0 3px;
          color: rgba(230,213,184,.76);
          font-size: 12px;
          line-height: 1.7;
          letter-spacing: .025em;
        }

        .account-index {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 32px;
          color: rgba(230,213,184,.52);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .account-index strong {
          color: var(--yellow);
          font-size: 9px;
        }

        .account-form-wrap {
          width: 100%;
          max-width: 540px;
          justify-self: end;
          padding: clamp(28px, 3.2vw, 42px);
          background: linear-gradient(145deg, rgba(27,26,23,.55), rgba(27,26,23,.26));
          border: 1px solid rgba(230,213,184,.18);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          box-shadow: 0 28px 70px rgba(0,0,0,.26);
          animation: accountFormIn .8s cubic-bezier(.2,.75,.25,1) .12s both;
        }

        .account-form-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .account-form-kicker {
          margin-bottom: 8px;
          color: var(--yellow);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .account-form-title {
          margin: 0;
          color: var(--cream);
          font-size: clamp(24px, 2.4vw, 34px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: -.025em;
        }

        .account-form-number {
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(240,165,0,.72);
          color: var(--yellow);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .account-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 1px solid rgba(230,213,184,.18);
          border-bottom: 1px solid rgba(230,213,184,.18);
          margin-bottom: 28px;
        }

        .account-switch button {
          position: relative;
          padding: 13px 4px 12px;
          border: 0;
          background: transparent;
          color: rgba(230,213,184,.42);
          cursor: pointer;
          font: inherit;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
          transition: color .2s ease;
        }

        .account-switch button + button {
          border-left: 1px solid rgba(230,213,184,.12);
        }

        .account-switch button::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: var(--yellow);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .3s cubic-bezier(.2,.75,.25,1);
        }

        .account-switch button:hover,
        .account-switch button[aria-selected="true"] {
          color: var(--yellow);
        }

        .account-switch button[aria-selected="true"]::after {
          transform: scaleX(1);
        }

        .account-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: formSwap .35s ease both;
        }

        .account-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .account-field label {
          color: rgba(230,213,184,.68);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .account-field input {
          width: 100%;
          height: 46px;
          padding: 0 13px;
          border: 1px solid rgba(230,213,184,.18);
          border-radius: 0;
          outline: 0;
          background: rgba(27,26,23,.28);
          color: var(--cream);
          font: inherit;
          font-size: 13px;
          letter-spacing: .02em;
          transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .account-field input::placeholder {
          color: rgba(230,213,184,.28);
        }

        .account-field input:focus {
          border-color: rgba(240,165,0,.82);
          background: rgba(27,26,23,.42);
          box-shadow: 0 0 0 1px rgba(240,165,0,.1);
        }

        .account-field input:disabled {
          opacity: .55;
        }

        .account-submit {
          width: 100%;
          min-height: 48px;
          margin-top: 4px;
          border: 0;
          background: var(--yellow);
          color: var(--ink);
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .18em;
          text-transform: uppercase;
          transition: transform .2s ease, filter .2s ease;
        }

        .account-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }

        .account-submit:disabled {
          opacity: .55;
          cursor: wait;
        }

        .account-feedback {
          min-height: 30px;
          margin: -4px 0 0;
          font-size: 9px;
          line-height: 1.5;
          letter-spacing: .02em;
        }

        .account-feedback--error { color: #ff9a76; }
        .account-feedback--success { color: var(--yellow); }

        .account-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          color: rgba(230,213,184,.62);
        }

        .account-description {
          max-width: 430px;
          font-size: 10px;
          line-height: 1.6;
          letter-spacing: .025em;
        }

        .account-description strong {
          display: block;
          margin-bottom: 5px;
          color: var(--yellow);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .account-copyright {
          white-space: nowrap;
          font-size: 8px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        @keyframes accountIntroIn {
          from { opacity: 0; transform: translateX(-28px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes accountFormIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes formSwap {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .account-content {
            width: min(720px, calc(100vw - 44px));
            padding: 24px 0;
          }

          .account-main {
            overflow-y: auto;
            padding: 30px 0;
          }

          .account-composition {
            grid-template-columns: 1fr;
            gap: 34px;
          }

          .account-intro {
            padding-bottom: 0;
          }

          .account-title {
            font-size: clamp(48px, 11vw, 78px);
          }

          .account-copy,
          .account-index {
            display: none;
          }

          .account-form-wrap {
            justify-self: stretch;
            max-width: none;
          }
        }

        @media (max-width: 560px) {
          .account-content {
            width: calc(100vw - 32px);
            padding: 18px 0;
          }

          .account-logo {
            font-size: 9px;
            letter-spacing: .2em;
          }

          .account-composition {
            gap: 24px;
          }

          .account-title {
            font-size: clamp(42px, 15vw, 64px);
          }

          .account-eyebrow {
            margin-bottom: 14px;
          }

          .account-form-wrap {
            padding: 24px 20px;
          }

          .account-form-head {
            margin-bottom: 20px;
          }

          .account-bottom {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .account-page * {
            animation-duration: .01ms !important;
            animation-delay: 0ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <img
        className="account-background"
        src="/account/account-background.png"
        alt=""
        aria-hidden="true"
      />
      <div className="account-overlay" aria-hidden="true" />
      <div className="account-noise" aria-hidden="true" />

      <div className="account-content">
        <header className="account-top">
          <Link to="/" className="account-back">
            <span aria-hidden="true">←</span>
            Quay về trang chủ
          </Link>
          <div className="account-logo">UpThink / Customer</div>
        </header>

        <div className="account-main">
          <div className="account-composition">
            <section className="account-intro" aria-labelledby="account-title">
              <div className="account-eyebrow">Customer Account / 2026</div>
              <h1 id="account-title" className="account-title">
                <span>Không gian</span>
                <span className="account-title-accent">của bạn.</span>
              </h1>
              <p className="account-copy">
                Lưu lại hành trình mua sắm, quản lý đơn hàng và tiếp tục khám phá
                trải nghiệm thời trang cá nhân hóa của UpThink.
              </p>
              <div className="account-index">
                <strong>01</strong>
                <span>Private customer area</span>
              </div>
            </section>

            <section className="account-form-wrap" aria-label="Customer account access">
              <div className="account-form-head">
                <div>
                  <div className="account-form-kicker">Customer Access</div>
                  <h2 className="account-form-title">
                    {mode === "login" ? "Đăng nhập" : "Đăng ký"}
                  </h2>
                </div>
                <div className="account-form-number">{mode === "login" ? "01" : "02"}</div>
              </div>

              <div className="account-switch" role="tablist" aria-label="Chọn trạng thái tài khoản">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "login"}
                  onClick={() => switchMode("login")}
                >
                  01 / Đăng nhập
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "register"}
                  onClick={() => switchMode("register")}
                >
                  02 / Đăng ký
                </button>
              </div>

              <form className="account-form" key={mode} onSubmit={handleSubmit}>
                <div className="account-field">
                  <label htmlFor="account-email">Email</label>
                  <input
                    id="account-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="account-field">
                  <label htmlFor="account-password">Mật khẩu</label>
                  <input
                    id="account-password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                {mode === "register" && (
                  <div className="account-field">
                    <label htmlFor="account-confirm-password">Xác nhận mật khẩu</label>
                    <input
                      id="account-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>
                )}

                <button className="account-submit" type="submit" disabled={loading}>
                  {loading
                    ? "Đang xử lý..."
                    : mode === "login"
                      ? "Đăng nhập  →"
                      : "Tạo tài khoản  →"}
                </button>

                <div
                  className={`account-feedback ${error ? "account-feedback--error" : "account-feedback--success"}`}
                  role="status"
                  aria-live="polite"
                >
                  {error || message}
                </div>
              </form>
            </section>
          </div>
        </div>

        <footer className="account-bottom">
          <div className="account-description">
            <strong>UpThink</strong>
            Một ý tưởng khởi nghiệp của sinh viên IUH: thời trang cá nhân hóa với AI concept và virtual try-on.
          </div>
          <div className="account-copyright">© 2026 UpThink — Đại học Công nghiệp TP.HCM / IUH</div>
        </footer>
      </div>
    </main>
  );
}
