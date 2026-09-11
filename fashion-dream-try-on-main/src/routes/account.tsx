import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { signInCustomer, signUpCustomer } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

const BACKGROUND_IMAGE = "/account/account-background.png";
const FOREGROUND_IMAGE = "/account/account-2-people-sitting-cutout.png";

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
    setMessage("");
    setError("");
    setMode(nextMode);
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
      setError(submitError instanceof Error ? submitError.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="account-page">
      <style>{`
        html:has(.account-page), body:has(.account-page) {
          margin: 0;
          overflow: hidden;
        }

        .account-page {
          --cream: #e6d5b8;
          --yellow: #f0a500;
          --ink: #1b1a17;
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          isolation: isolate;
          background: var(--ink);
          color: var(--cream);
          font-family: inherit;
        }

        .account-page::before {
          content: "";
          position: absolute;
          inset: -34px;
          z-index: 0;
          background: url("/account/account-background.png") center / cover no-repeat;
          filter: blur(30px) brightness(.28) saturate(.78);
          transform: scale(1.06);
          pointer-events: none;
        }

        .account-page::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(90deg,
              rgba(27,26,23,.96) 0%,
              rgba(27,26,23,.72) 5%,
              rgba(27,26,23,.28) 12%,
              rgba(27,26,23,0) 19%,
              rgba(27,26,23,0) 81%,
              rgba(27,26,23,.28) 88%,
              rgba(27,26,23,.72) 95%,
              rgba(27,26,23,.96) 100%),
            linear-gradient(180deg, rgba(0,0,0,.16) 0%, rgba(0,0,0,0) 55%, rgba(10,8,6,.5) 100%);
        }

        .account-page * { box-sizing: border-box; }

        .account-stage {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          width: min(100vw, calc(100dvh * 16 / 9));
          height: min(100dvh, calc(100vw * 9 / 16));
          transform: translate(-50%, -50%);
          aspect-ratio: 16 / 9;
          overflow: hidden;
          isolation: isolate;
          background: var(--ink);
          box-shadow: 0 0 90px rgba(0,0,0,.22);
        }

        .account-stage::before {
          content: "";
          position: absolute;
          inset: -10%;
          z-index: -2;
          background: url("/account/account-background.png") center / cover no-repeat;
          filter: blur(22px) brightness(.34);
          transform: scale(1.08);
        }

        .account-background,
        .account-cutout {
          position: absolute;
          pointer-events: none;
          user-select: none;
        }

        .account-background {
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;
        }

        .account-stage::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,.06) 45%, rgba(10,8,6,.88) 100%);
        }

        .account-cutout {
          left: 0;
          bottom: 0;
          z-index: 3;
          width: 67%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          opacity: 0;
          filter: drop-shadow(8px 14px 18px rgba(0,0,0,.16));
          animation: accountCutoutIn .9s cubic-bezier(.2,.75,.25,1) .12s forwards;
        }

        .account-back-link,
        .account-brand,
        .account-title,
        .account-panel,
        .account-info,
        .account-copyright { position: absolute; }

        .account-back-link {
          top: 5.2%;
          left: 4.1%;
          z-index: 70;
          color: var(--cream);
          text-decoration: none;
          text-transform: uppercase;
          font-size: clamp(9px, .72vw, 11px);
          font-weight: 700;
          letter-spacing: .12em;
          transition: color .2s ease, transform .2s ease;
        }
        .account-back-link:hover { color: var(--yellow); transform: translateX(-3px); }

        .account-brand {
          top: 14.3%;
          left: 12%;
          z-index: 70;
          color: var(--yellow);
          font-size: clamp(11px, .92vw, 16px);
          font-weight: 900;
          letter-spacing: .24em;
          line-height: 1;
          text-transform: uppercase;
          text-shadow: 0 2px 16px rgba(0,0,0,.58);
          opacity: 0;
          animation: accountFadeUp .65s ease .2s forwards;
        }
        .account-brand::after {
          content: "";
          display: block;
          width: clamp(30px, 3.4vw, 58px);
          height: 2px;
          margin-top: 8px;
          background: var(--yellow);
          transform-origin: left;
          animation: brandRuleIn .55s cubic-bezier(.2,.75,.25,1) .48s both;
        }

        .account-title {
          top: 19%;
          left: 12%;
          z-index: 4;
          width: 52%;
          margin: 0;
          color: var(--cream);
          font-size: clamp(48px, 7.05vw, 108px);
          line-height: .91;
          font-weight: 900;
          letter-spacing: .026em;
          text-transform: uppercase;
          text-shadow: 0 8px 26px rgba(0,0,0,.16);
          pointer-events: none;
        }

        .account-title-line { display: block; opacity: 0; will-change: transform, opacity, filter; white-space: nowrap; }
        .account-title-line--first { animation: titleFirstIn .75s cubic-bezier(.2,.75,.25,1) .08s forwards; }
        .account-title-line--second { margin-left: 2.3%; animation: titleSecondIn .75s cubic-bezier(.2,.75,.25,1) .02s forwards; }

        .account-panel {
          top: 50%;
          right: 10%;
          z-index: 90;
          width: min(520px, 38%);
          min-height: 454px;
          transform: translateY(-50%);
          padding: 26px 0 0;
          background: linear-gradient(180deg, rgba(18,15,12,.42), rgba(18,15,12,.20));
          border: 1px solid rgba(230,213,184,.10);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          box-shadow: 0 22px 55px rgba(0,0,0,.14);
          opacity: 0;
          animation: panelIn .75s cubic-bezier(.2,.75,.25,1) .3s forwards;
        }

        .account-panel-inner { height: 100%; min-height: 428px; padding: 0 clamp(24px, 2.2vw, 38px) 28px; display: flex; flex-direction: column; }
        .account-kicker { color: var(--yellow); font-size: 9px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; margin-bottom: 7px; }
        .account-heading { display: flex; align-items: center; gap: 10px; margin: 0 0 22px; font-size: 17px; letter-spacing: .04em; font-weight: 500; }
        .account-heading::before { content: "01"; display: grid; place-items: center; width: 27px; height: 27px; border: 1px solid var(--yellow); color: var(--yellow); font-size: 8px; letter-spacing: .08em; }

        .account-tabs { display: flex; gap: 24px; margin-bottom: 24px; border-bottom: 1px solid rgba(230,213,184,.26); }
        .account-tab { position: relative; padding: 0 0 11px; border: 0; background: transparent; color: rgba(230,213,184,.45); cursor: pointer; font: inherit; font-size: 9px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; transition: color .2s ease; }
        .account-tab::after { content: ""; position: absolute; left: 0; bottom: -1px; width: 0; height: 2px; background: var(--yellow); transition: width .32s cubic-bezier(.2,.75,.25,1); }
        .account-tab:hover, .account-tab--active { color: var(--yellow); }
        .account-tab--active::after { width: 100%; }

        .account-form-stage { position: relative; min-height: 264px; flex: 1; overflow: hidden; }
        .account-form { position: absolute; inset: 0; display: flex; flex-direction: column; min-height: 264px; animation: formIn .45s cubic-bezier(.2,.75,.25,1); }
        .account-field { margin-bottom: 18px; }
        .account-field label { display: block; margin-bottom: 7px; color: rgba(230,213,184,.7); font-size: 8px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
        .account-field input { width: 100%; height: 39px; padding: 0; border: 0; border-bottom: 1px solid rgba(230,213,184,.36); outline: 0; border-radius: 0; background: rgba(27,26,23,.22); color: var(--cream); font: inherit; font-size: 13px; letter-spacing: .02em; transition: border-color .2s ease, padding-left .2s ease, background .2s ease; }
        .account-field input:focus { border-bottom-color: var(--yellow); padding-left: 5px; background: rgba(27,26,23,.34); }
        .account-field input:-webkit-autofill, .account-field input:-webkit-autofill:hover, .account-field input:-webkit-autofill:focus { -webkit-text-fill-color: var(--cream); -webkit-box-shadow: 0 0 0 1000px rgba(27,26,23,.72) inset; box-shadow: 0 0 0 1000px rgba(27,26,23,.72) inset; transition: background-color 9999s ease-in-out 0s; }
        .account-submit { margin-top: auto; width: 100%; min-height: 42px; border: 0; background: var(--yellow); color: var(--ink); cursor: pointer; font: inherit; font-size: 9px; font-weight: 900; letter-spacing: .17em; text-transform: uppercase; transition: transform .2s ease, filter .2s ease; }
        .account-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
        .account-submit:disabled { opacity: .55; cursor: wait; }
        .account-feedback { min-height: 38px; margin-top: 11px; font-size: 9px; line-height: 1.5; letter-spacing: .03em; }
        .account-feedback--error { color: #ff9a76; }
        .account-feedback--success { color: var(--yellow); }

        .account-info {
          left: 3.8%;
          bottom: 5.3%;
          z-index: 70;
          max-width: 38%;
          opacity: 0;
          animation: accountFadeUp .7s ease .48s forwards;
        }
        .account-info strong {
          display: block;
          margin-bottom: 10px;
          color: var(--yellow);
          font-size: 17px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .account-info p {
          margin: 0;
          color: rgba(230,213,184,.86);
          font-size: 15px;
          line-height: 1.58;
          letter-spacing: .025em;
        }
        .account-copyright {
          right: 3.8%;
          bottom: 5.3%;
          z-index: 70;
          color: rgba(230,213,184,.76);
          font-size: 12px;
          letter-spacing: .04em;
        }

        @keyframes accountCutoutIn { from { opacity: 0; transform: scale(1.012); } to { opacity: 1; transform: scale(1); } }
        @keyframes titleFirstIn { from { opacity: 0; transform: translateX(26px); filter: blur(5px); } to { opacity: 1; transform: translateX(0); filter: blur(0); } }
        @keyframes titleSecondIn { from { opacity: 0; transform: translateX(-22px); filter: blur(5px); } to { opacity: 1; transform: translateX(0); filter: blur(0); } }
        @keyframes panelIn { from { opacity: 0; transform: translate(24px, -50%); } to { opacity: 1; transform: translate(0, -50%); } }
        @keyframes formIn { from { opacity: 0; transform: translateX(18px); filter: blur(3px); } to { opacity: 1; transform: translateX(0); filter: blur(0); } }
        @keyframes accountFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes brandRuleIn { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }
        @keyframes panelMobileIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) and (min-width: 701px) {
          .account-title { left: 9%; font-size: clamp(48px, 7.8vw, 78px); }
          .account-panel { right: 5%; width: 40%; }
          .account-brand { left: 9%; font-size: clamp(10px, 1.05vw, 14px); }
          .account-info { max-width: 36%; }
          .account-info strong { font-size: 15px; }
          .account-info p { font-size: 13px; }
          .account-copyright { font-size: 10px; }
        }

        @media (max-width: 700px) {
          .account-stage {
            width: 100vw;
            height: 100dvh;
            aspect-ratio: auto;
          }
          .account-background { object-fit: cover; object-position: 58% center; }
          .account-cutout { width: 100%; height: 58%; object-fit: cover; object-position: center bottom; }
          .account-stage::after { background: linear-gradient(180deg, rgba(0,0,0,.14), rgba(10,8,6,.48) 42%, rgba(10,8,6,.98) 100%); }
          .account-back-link { top: 20px; left: 22px; font-size: 9px; }
          .account-brand { top: 72px; left: 22px; font-size: 11px; letter-spacing: .18em; }
          .account-title { top: 98px; left: 22px; width: auto; font-size: clamp(45px, 15vw, 68px); letter-spacing: .02em; line-height: .9; }
          .account-title-line--second { margin-left: 14px; }
          .account-panel { top: auto; right: 18px; bottom: 18px; width: calc(100% - 36px); min-height: 370px; transform: none; padding-top: 22px; background: linear-gradient(180deg, rgba(18,15,12,.54), rgba(18,15,12,.30)); animation-name: panelMobileIn; }
          .account-panel-inner { min-height: 344px; padding: 0 20px 20px; }
          .account-form-stage, .account-form { min-height: 208px; }
          .account-info, .account-copyright { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .account-page *, .account-page::after { animation-duration: .01ms !important; animation-delay: 0ms !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <div className="account-stage">
        <img className="account-background" src={BACKGROUND_IMAGE} alt="" aria-hidden="true" />
        <Link to="/" className="account-back-link">← Quay về trang chủ</Link>
        <div className="account-brand">UpThink Customer Account</div>

        <h1 className="account-title" aria-label="Không gian của bạn.">
          <span className="account-title-line account-title-line--second">Không gian</span>
          <span className="account-title-line account-title-line--first">Của bạn.</span>
        </h1>

        <section className="account-panel" aria-label="Customer account access">
          <div className="account-panel-inner">
            <div className="account-kicker">Customer Access</div>
            <h2 className="account-heading">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h2>

            <div className="account-tabs" role="tablist" aria-label="Chọn trạng thái tài khoản">
              <button type="button" role="tab" aria-selected={mode === "login"} className={`account-tab ${mode === "login" ? "account-tab--active" : ""}`} onClick={() => switchMode("login")}>01 / Đăng nhập</button>
              <button type="button" role="tab" aria-selected={mode === "register"} className={`account-tab ${mode === "register" ? "account-tab--active" : ""}`} onClick={() => switchMode("register")}>02 / Đăng ký</button>
            </div>

            <div className="account-form-stage" key={mode}>
              <form className="account-form" onSubmit={handleSubmit}>
                <div className="account-field">
                  <label htmlFor="account-email">Email</label>
                  <input id="account-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} />
                </div>
                <div className="account-field">
                  <label htmlFor="account-password">Mật khẩu</label>
                  <input id="account-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} disabled={loading} />
                </div>
                {mode === "register" && (
                  <div className="account-field">
                    <label htmlFor="account-confirm-password">Xác nhận mật khẩu</label>
                    <input id="account-confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={6} disabled={loading} />
                  </div>
                )}
                <button className="account-submit" type="submit" disabled={loading}>
                  {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập  →" : "Tạo tài khoản  →"}
                </button>
                <div className={`account-feedback ${error ? "account-feedback--error" : "account-feedback--success"}`} role="status" aria-live="polite">{error || message}</div>
              </form>
            </div>
          </div>
        </section>

        <div className="account-info">
          <strong>UpThink</strong>
          <p>Một ý tưởng khởi nghiệp của sinh viên IUH: thời trang cá nhân hóa với AI concept và virtual try-on.</p>
        </div>
        <div className="account-copyright">© 2026 UpThink — Đại học Công nghiệp TP.HCM / IUH</div>
        <img className="account-cutout" src={FOREGROUND_IMAGE} alt="" aria-hidden="true" />
      </div>
    </main>
  );
}
