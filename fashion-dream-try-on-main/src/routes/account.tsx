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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        const signupResult = await signUpCustomer(email, password);
        setMessage(
          signupResult.access_token
            ? "Đăng ký thành công."
            : "Đăng ký thành công. Kiểm tra email để xác nhận tài khoản trước khi đăng nhập.",
        );
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

        .account-password-wrap {
          position: relative;
        }

        .account-password-wrap input {
          padding-right: 48px;
        }

        .account-password-toggle {
          position: absolute;
          top: 50%;
          right: 4px;
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-50%);
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(230,213,184,.52);
          cursor: pointer;
          transition: color .2s ease, transform .2s ease;
        }

        .account-password-toggle:hover,
        .account-password-toggle:focus-visible {
          color: var(--yellow);
        }

        .account-password-toggle:focus-visible {
          outline: 1px solid rgba(240,165,0,.72);
          outline-offset: -1px;
        }

        .account-password-toggle svg {
          width: 17px;
          height: 17px;
          stroke: currentColor;
          stroke-width: 1.7;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
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
          color: var(--cream);
          font-weight: 800;
        }

        .account-meta {
          display: flex;
          gap: 22px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .account-meta span:last-child {
          color: var(--yellow);
        }

        @keyframes accountIntroIn {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes accountFormIn {
          from { opacity: 0; transform: translateY(26px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes formSwap {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          :root:has(.account-page),
          body:has(.account-page) {
            overflow: auto;
          }

          .account-page {
            position: relative;
            min-height: 100dvh;
            height: auto;
            overflow: hidden;
          }

          .account-content {
            width: min(720px, calc(100vw - 36px));
            min-height: 100dvh;
            height: auto;
            padding: 24px 0;
            grid-template-rows: auto auto auto;
          }

          .account-main {
            padding: 58px 0;
          }

          .account-composition {
            grid-template-columns: 1fr;
            gap: 34px;
          }

          .account-form-wrap {
            justify-self: stretch;
            max-width: none;
          }

          .account-title {
            font-size: clamp(52px, 13vw, 86px);
          }

          .account-bottom {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 520px) {
          .account-content {
            width: calc(100vw - 28px);
          }

          .account-form-wrap {
            padding: 24px 20px;
          }

          .account-form-head {
            margin-bottom: 20px;
          }

          .account-copy {
            margin-top: 20px;
          }

          .account-main {
            padding: 42px 0;
          }

          .account-meta {
            flex-wrap: wrap;
            white-space: normal;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .account-intro,
          .account-form-wrap,
          .account-form {
            animation: none;
          }

          .account-back,
          .account-submit,
          .account-password-toggle,
          .account-switch button,
          .account-field input {
            transition: none;
          }
        }
      `}</style>

      <img
        className="account-background"
        src="/account-background.jpg"
        alt=""
        aria-hidden="true"
      />
      <div className="account-overlay" aria-hidden="true" />
      <div className="account-noise" aria-hidden="true" />

      <div className="account-content">
        <header className="account-top">
          <Link className="account-back" to="/">
            <span aria-hidden="true">←</span>
            Back to shop
          </Link>
          <div className="account-logo">UPTHINK / ACCOUNT</div>
        </header>

        <section className="account-main">
          <div className="account-composition">
            <div className="account-intro">
              <div className="account-eyebrow">Fashion Dream / Member Access</div>
              <h1 className="account-title">
                <span>YOUR</span>
                <span className="account-title-accent">STYLE.</span>
                <span>YOUR</span>
                <span>SPACE.</span>
              </h1>
              <p className="account-copy">
                Sign in to manage your profile, orders, wishlist and AI Try-On experience. New here? Create your account in a few seconds.
              </p>
              <div className="account-index">
                <strong>SYS 01</strong>
                <span>MEMBER ACCESS</span>
                <span>ONLINE</span>
              </div>
            </div>

            <div className="account-form-wrap">
              <div className="account-form-head">
                <div>
                  <div className="account-form-kicker">Fashion Dream</div>
                  <h2 className="account-form-title">
                    {mode === "login" ? "Welcome back." : "Create account."}
                  </h2>
                </div>
                <div className="account-form-number">01</div>
              </div>

              <div className="account-switch" role="tablist" aria-label="Account access mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "login"}
                  onClick={() => switchMode("login")}
                  disabled={loading}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "register"}
                  onClick={() => switchMode("register")}
                  disabled={loading}
                >
                  Register
                </button>
              </div>

              <form className="account-form" onSubmit={handleSubmit} key={mode}>
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
                  <label htmlFor="account-password">Password</label>
                  <div className="account-password-wrap">
                    <input
                      id="account-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      className="account-password-toggle"
                      type="button"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setShowPassword((visible) => !visible)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.1A10.6 10.6 0 0 1 12 4.8c5.2 0 9 4.8 9 7.2a8.8 8.8 0 0 1-2.2 3.4" />
                          <path d="M6.2 6.3C4.1 7.6 3 9.8 3 12c0 2.4 3.8 7.2 9 7.2a10.4 10.4 0 0 0 4.1-.8" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z" />
                          <circle cx="12" cy="12" r="2.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {mode === "register" && (
                  <div className="account-field">
                    <label htmlFor="account-confirm-password">Confirm password</label>
                    <div className="account-password-wrap">
                      <input
                        id="account-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                      />
                      <button
                        className="account-password-toggle"
                        type="button"
                        aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                        title={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 3l18 18" />
                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                            <path d="M9.9 5.1A10.6 10.6 0 0 1 12 4.8c5.2 0 9 4.8 9 7.2a8.8 8.8 0 0 1-2.2 3.4" />
                            <path d="M6.2 6.3C4.1 7.6 3 9.8 3 12c0 2.4 3.8 7.2 9 7.2a10.4 10.4 0 0 0 4.1-.8" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z" />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="account-feedback account-feedback--error" role="alert">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="account-feedback account-feedback--success" role="status">
                    {message}
                  </p>
                )}

                <button className="account-submit" type="submit" disabled={loading}>
                  {loading
                    ? "Processing..."
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer className="account-bottom">
          <p className="account-description">
            <strong>Progressive access.</strong> Browse freely as a guest. Your account becomes useful when you want to save products, complete checkout, track orders or use AI Try-On.
          </p>
          <div className="account-meta">
            <span>UPTHINK / IUH</span>
            <span>SAIGON — 2026</span>
            <span>SYS 01 // ONLINE</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
