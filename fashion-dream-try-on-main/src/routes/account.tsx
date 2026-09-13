import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Heart, LogOut, Package, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { getCustomerSession, signInCustomer, signInWithGoogle, signOutCustomer } from "@/lib/auth";
import { supabaseConfig } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/account")({ component: AccountPage });
type Mode = "login" | "register";
type AccountUser = { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } };

function getFriendlyAuthCallbackError() {
  if (typeof window === "undefined" || !window.location.hash) return "";
  const params = new URLSearchParams(window.location.hash.slice(1));
  const code = params.get("error_code");
  const description = params.get("error_description");
  if (!code && !description) return "";
  if (code === "otp_expired" || /expired|invalid/i.test(description || "")) return "Liên kết xác nhận đã hết hạn hoặc đã được sử dụng. Hãy gửi lại email xác nhận để tiếp tục.";
  return "Xác nhận email chưa hoàn tất. Vui lòng thử lại bằng email xác nhận mới nhất.";
}

function signInWithFacebook() {
  if (typeof window === "undefined") return;
  const redirectTo = `${window.location.origin}/account`;
  const authorizeUrl = new URL(`${supabaseConfig.url}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "facebook");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);
  window.location.assign(authorizeUrl.toString());
}

function AccountPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const redirectTo = useMemo(() => typeof window === "undefined" ? "" : `${window.location.origin}/account?verified=1`, []);

  const loadUser = async () => {
    const session = getCustomerSession();
    if (!session?.access_token) { setUser(null); setCheckingUser(false); return; }
    try {
      const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, { headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${session.access_token}` } });
      if (!response.ok) throw new Error("Session không còn hợp lệ.");
      setUser((await response.json()) as AccountUser);
    } catch { setUser(null); }
    finally { setCheckingUser(false); }
  };

  useEffect(() => {
    const callbackError = getFriendlyAuthCallbackError();
    if (callbackError) {
      setError(callbackError);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
    if (new URLSearchParams(window.location.search).get("verified") === "1") {
      setMessage("Email đã được xác nhận. Chào mừng bạn đến với UpThink.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    void loadUser();
    const onAuth = () => void loadUser();
    window.addEventListener("upthink:auth:login", onAuth);
    window.addEventListener("upthink:auth:logout", onAuth);
    return () => { window.removeEventListener("upthink:auth:login", onAuth); window.removeEventListener("upthink:auth:logout", onAuth); };
  }, []);

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode); setMessage(""); setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setMessage(""); setError("");
    try {
      if (mode === "register") {
        if (!fullName.trim()) throw new Error("Vui lòng nhập tên tài khoản.");
        if (password !== confirmPassword) throw new Error("Mật khẩu xác nhận không khớp.");
        const normalizedEmail = email.trim().toLowerCase();
        const response = await fetch(`${supabaseConfig.url}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
          method: "POST",
          headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password, data: { full_name: fullName.trim() } }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "Không thể tạo tài khoản.");
        setEmail(normalizedEmail);
        setPassword(""); setConfirmPassword("");
        setMessage(data.access_token ? "Đăng ký thành công." : "Đăng ký thành công. Kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
        if (data.access_token) await loadUser();
      } else {
        await signInCustomer(email, password);
        setPassword(""); setMessage("Đăng nhập thành công."); await loadUser();
      }
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Đã xảy ra lỗi. Vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { setError("Nhập email để gửi lại email xác nhận."); return; }
    setResending(true); setMessage(""); setError("");
    try {
      const response = await fetch(`${supabaseConfig.url}/auth/v1/resend?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: "POST",
        headers: { apikey: supabaseConfig.key, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "signup", email: normalizedEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "Không thể gửi lại email xác nhận.");
      setMessage("Đã gửi lại email xác nhận. Hãy mở email mới nhất và chỉ nhấn xác nhận một lần.");
    } catch (resendError) { setError(resendError instanceof Error ? resendError.message : "Không thể gửi lại email xác nhận."); }
    finally { setResending(false); }
  };

  const handleLogout = async () => { setLoading(true); await signOutCustomer(); setMessage("Bạn đã đăng xuất."); setLoading(false); };

  if (checkingUser) return <main className="account-page"><div className="account-loading">UPTHINK / VERIFYING ACCOUNT</div></main>;

  return (
    <main className="account-page">
      <style>{`
        :root:has(.account-page),body:has(.account-page){margin:0;overflow:hidden}
        .account-page{--cream:#e6d5b8;--orange:#f0a500;--red:#e45826;--ink:#1b1a17;--panel:rgba(27,26,23,.86);position:fixed;inset:0;overflow:auto;background-image:linear-gradient(135deg,rgba(27,26,23,.84),rgba(48,37,26,.58) 58%,rgba(27,26,23,.86)),url('/account/account-background.png');background-size:cover;background-position:center;background-repeat:no-repeat;color:var(--cream);font-family:inherit;isolation:isolate}.account-page *{box-sizing:border-box}.account-loading{min-height:100dvh;display:grid;place-items:center;color:var(--orange);font:800 9px Arial,sans-serif;letter-spacing:.22em}.account-shell{position:relative;z-index:2;width:min(1180px,calc(100vw - 48px));min-height:100%;margin:auto;padding:24px 0;display:flex;flex-direction:column}.account-top{display:flex;align-items:center;justify-content:space-between;gap:20px}.account-brand,.account-back{color:var(--cream);text-decoration:none}.account-brand{display:flex;align-items:center;gap:10px}.account-mark{display:grid;place-items:center;width:30px;height:30px;background:var(--orange);color:var(--ink);font-weight:900}.account-brand strong{font-size:18px;letter-spacing:.1em}.account-brand small{display:block;color:var(--orange);font-size:7px;letter-spacing:.18em;margin-top:2px}.account-back{display:flex;align-items:center;gap:7px;color:rgba(230,213,184,.65);font:700 8px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}.account-back:hover{color:var(--orange)}.account-main{flex:1;display:flex;align-items:center;padding:36px 0}.account-auth-grid{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.account-kicker{color:var(--orange);font:800 9px Arial,sans-serif;letter-spacing:.2em}.account-title{margin:12px 0 0;font:900 clamp(58px,8vw,112px)/.82 Arial,sans-serif;letter-spacing:-.055em;text-transform:uppercase}.account-title span{display:block}.account-title .accent{color:var(--orange)}.account-copy{max-width:430px;margin:28px 0 0;color:rgba(230,213,184,.72);font-size:13px;line-height:1.7}.account-index{margin-top:30px;color:rgba(230,213,184,.42);font:800 8px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}.account-index b{color:var(--orange);margin-right:12px}.account-card{background:var(--panel);border:1px solid rgba(230,213,184,.18);border-left:3px solid var(--orange);padding:32px;box-shadow:18px 18px 0 rgba(0,0,0,.22)}.account-card-head{display:flex;justify-content:space-between;gap:20px;margin-bottom:22px}.account-kicker-small{color:var(--orange);font:800 8px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase}.account-card h2{margin:7px 0 0;font:600 30px/1.1 Georgia,serif}.account-number{display:grid;place-items:center;width:32px;height:32px;border:1px solid rgba(240,165,0,.65);color:var(--orange);font:800 8px Arial,sans-serif}.account-switch{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(230,213,184,.18);border-bottom:1px solid rgba(230,213,184,.18);margin-bottom:24px}.account-switch button{position:relative;padding:12px;border:0;background:transparent;color:rgba(230,213,184,.45);font:800 8px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}.account-switch button[aria-selected=true]{color:var(--cream)}.account-switch button[aria-selected=true]:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--orange)}.account-google-wrap{display:flex;align-items:center;gap:10px;margin:0 0 12px;color:rgba(230,213,184,.35);font:700 7px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}.account-google-wrap:before,.account-google-wrap:after{content:"";height:1px;flex:1;background:rgba(230,213,184,.15)}.account-socials{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 18px}.account-social{width:100%;height:46px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid rgba(230,213,184,.22);background:rgba(0,0,0,.16);color:var(--cream);font:800 8px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}.account-social:hover{border-color:var(--orange);background:rgba(240,165,0,.06)}.account-social img{width:20px;height:20px;display:block;flex:none;object-fit:contain}.account-form{display:flex;flex-direction:column;gap:16px}.account-field{display:flex;flex-direction:column;gap:7px}.account-field label{font:800 8px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:rgba(230,213,184,.68)}.account-field input{height:46px;width:100%;padding:0 12px;border:1px solid rgba(230,213,184,.18);background:rgba(0,0,0,.22);color:var(--cream);outline:none;border-radius:0}.account-field input:focus{border-color:var(--orange)}.account-password{position:relative}.account-password input{padding-right:46px}.account-eye{position:absolute;right:3px;top:3px;width:40px;height:40px;border:0;background:transparent;color:rgba(230,213,184,.55);cursor:pointer}.account-feedback{margin:0;font:9px/1.55 Arial,sans-serif}.account-feedback--error{color:#ffc5a8}.account-feedback--success{color:var(--cream)}.account-submit{min-height:48px;border:0;background:var(--orange);color:var(--ink);font:900 9px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;cursor:pointer}.account-submit:disabled{opacity:.55;cursor:wait}.account-resend{border:0;background:transparent;color:var(--orange);font:800 8px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;text-align:left}.account-resend:disabled{opacity:.5}.account-dashboard{width:100%}.account-welcome{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;border-bottom:1px solid rgba(230,213,184,.16);padding-bottom:26px}.account-welcome h1{margin:8px 0 0;font:900 clamp(42px,6vw,78px)/.88 Arial,sans-serif;letter-spacing:-.05em;text-transform:uppercase}.account-welcome h1 span{color:var(--orange)}.account-welcome p{max-width:460px;color:rgba(230,213,184,.65);font-size:12px;line-height:1.7}.account-logout{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(230,213,184,.2);background:transparent;color:rgba(230,213,184,.7);padding:10px 13px;font:800 8px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.account-logout:hover{border-color:var(--orange);color:var(--orange)}.account-modules{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}.account-module{min-height:150px;padding:20px;border:1px solid rgba(230,213,184,.15);background:rgba(27,26,23,.6);color:var(--cream);text-decoration:none;display:flex;flex-direction:column;justify-content:space-between;transition:.2s}.account-module:hover{transform:translateY(-3px);border-color:rgba(240,165,0,.55);background:rgba(240,165,0,.07)}.account-module-icon{color:var(--orange)}.account-module strong{font-size:13px}.account-module small{display:block;margin-top:6px;color:rgba(230,213,184,.45);font:800 7px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.account-profile{margin-top:18px;display:grid;grid-template-columns:1.3fr .7fr;gap:12px}.account-profile-card{padding:20px;border:1px solid rgba(230,213,184,.15);background:rgba(27,26,23,.6)}.account-profile-card h3{margin:0 0 16px;color:var(--orange);font:800 8px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}.account-profile-row{display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid rgba(230,213,184,.08);font-size:12px}.account-profile-row:last-child{border-bottom:0}.account-profile-row span{color:rgba(230,213,184,.45)}.account-note{color:rgba(230,213,184,.62);font-size:11px;line-height:1.7}.account-note strong{color:var(--cream)}.account-bottom{padding-top:20px;color:rgba(230,213,184,.35);font:800 7px Arial,sans-serif;letter-spacing:.15em;text-transform:uppercase}.account-bottom b{color:var(--orange)}
        @media(max-width:900px){.account-auth-grid{grid-template-columns:1fr;gap:30px}.account-modules{grid-template-columns:repeat(2,1fr)}.account-profile{grid-template-columns:1fr}.account-welcome{align-items:flex-start;flex-direction:column}.account-title{font-size:clamp(54px,15vw,84px)}}
        @media(max-width:560px){:root:has(.account-page),body:has(.account-page){overflow:auto}.account-shell{width:calc(100vw - 28px);padding:14px 0}.account-main{padding:30px 0}.account-card{padding:22px 18px}.account-modules{grid-template-columns:1fr}.account-module{min-height:125px}.account-brand strong{font-size:16px}.account-back span{display:none}.account-social{font-size:7px;letter-spacing:.06em}.account-socials{gap:8px}}
      `}</style>
      <div className="account-shell">
        <header className="account-top">
          <Link to="/" className="account-brand" aria-label="UpThink home"><span className="account-mark">U</span><span><strong>UPTHINK.</strong><small>AI FASHION / 2026</small></span></Link>
          <Link to="/" className="account-back"><ArrowLeft size={13}/><span>Back to collection</span></Link>
        </header>

        <section className="account-main">
          {user ? (
            <div className="account-dashboard">
              <div className="account-welcome">
                <div><div className="account-kicker">UPTHINK / PERSONAL FASHION SYSTEM</div><h1>CHÀO MỪNG <span>{user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "BẠN"}</span></h1></div>
                <div><p>Không gian cá nhân của bạn đã sẵn sàng. Quản lý tài khoản, khám phá sản phẩm và tiếp tục hành trình AI TRY-ON theo phong cách riêng.</p><button className="account-logout" type="button" onClick={handleLogout} disabled={loading}><LogOut size={13}/> Đăng xuất</button></div>
              </div>
              <div className="account-modules">
                <Link className="account-module" to="/shop"><span className="account-module-icon"><Sparkles size={22}/></span><span><strong>Khám phá sản phẩm</strong><small>Shop / Collection</small></span></Link>
                <Link className="account-module" to="/ai"><span className="account-module-icon"><WandSparkles size={22}/></span><span><strong>AI TRY-ON</strong><small>Virtual fitting</small></span></Link>
                <Link className="account-module" to="/cart"><span className="account-module-icon"><Package size={22}/></span><span><strong>Giỏ hàng</strong><small>Cart / Checkout</small></span></Link>
                <div className="account-module"><span className="account-module-icon"><Heart size={22}/></span><span><strong>Sản phẩm yêu thích</strong><small>Personalization / Coming soon</small></span></div>
              </div>
              <div className="account-profile">
                <div className="account-profile-card"><h3><UserRound size={12} style={{verticalAlign:"-2px",marginRight:6}}/> Hồ sơ tài khoản</h3><div className="account-profile-row"><span>Tên tài khoản</span><strong>{user.user_metadata?.full_name || user.user_metadata?.name || "Chưa cập nhật"}</strong></div><div className="account-profile-row"><span>Email</span><strong>{user.email || "—"}</strong></div><div className="account-profile-row"><span>Account ID</span><strong>{user.id.slice(0, 8)}…</strong></div></div>
                <div className="account-profile-card"><h3>PERSONALIZATION</h3><p className="account-note"><strong>Phong cách của bạn.</strong><br/>Đây là nền tảng để bổ sung wishlist, lịch sử AI TRY-ON, style preferences và đề xuất stylist cá nhân hóa trong các milestone tiếp theo.</p></div>
              </div>
            </div>
          ) : (
            <div className="account-auth-grid">
              <div><div className="account-kicker">UPTHINK / MEMBER ACCESS</div><h1 className="account-title"><span>YOUR</span><span>STYLE.</span><span className="accent">YOUR ID.</span></h1><p className="account-copy">Đăng nhập để lưu phong cách, quản lý trải nghiệm mua sắm và tiếp tục hành trình thử đồ AI của bạn.</p><div className="account-index"><b>01</b> PERSONAL FASHION SYSTEM / ONLINE</div></div>
              <div className="account-card">
                <div className="account-card-head"><div><div className="account-kicker-small">Account / Access</div><h2>{mode === "login" ? "Welcome back" : "Create account"}</h2></div><span className="account-number">{mode === "login" ? "01" : "02"}</span></div>
                <div className="account-switch" role="tablist" aria-label="Account mode"><button type="button" role="tab" aria-selected={mode === "login"} onClick={() => switchMode("login")}>Đăng nhập</button><button type="button" role="tab" aria-selected={mode === "register"} onClick={() => switchMode("register")}>Đăng ký</button></div>
                <div className="account-google-wrap"><span>OR CONTINUE WITH</span></div>
                <div className="account-socials">
                  <button className="account-social" type="button" onClick={signInWithGoogle} disabled={loading}><img src="/brand/google-g.svg" alt="Google"/><span>Continue with Google</span></button>
                  <button className="account-social" type="button" onClick={signInWithFacebook} disabled={loading}><img src="/brand/facebook.svg" alt="Facebook"/><span>Continue with Facebook</span></button>
                </div>
                <form className="account-form" onSubmit={handleSubmit}>
                  {mode === "register" && <div className="account-field"><label htmlFor="account-name">Tên tài khoản</label><input id="account-name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Tên hiển thị của bạn" autoComplete="name" disabled={loading} required/></div>}
                  <div className="account-field"><label htmlFor="account-email">Email</label><input id="account-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" disabled={loading} required/></div>
                  <div className="account-field"><label htmlFor="account-password">Mật khẩu</label><div className="account-password"><input id="account-password" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} disabled={loading} required minLength={6}/><button className="account-eye" type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Ẩn mật khẩu":"Hiện mật khẩu"} disabled={loading}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>
                  {mode === "register" && <div className="account-field"><label htmlFor="account-confirm-password">Xác nhận mật khẩu</label><div className="account-password"><input id="account-confirm-password" type={showConfirmPassword?"text":"password"} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" disabled={loading} required minLength={6}/><button className="account-eye" type="button" onClick={()=>setShowConfirmPassword(v=>!v)} aria-label={showConfirmPassword?"Ẩn mật khẩu xác nhận":"Hiện mật khẩu xác nhận"} disabled={loading}>{showConfirmPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>}
                  {error && <p className="account-feedback account-feedback--error" role="alert">{error}</p>}
                  {message && <p className="account-feedback account-feedback--success" role="status">{message}</p>}
                  {mode === "register" && message && !user && <button className="account-resend" type="button" onClick={handleResend} disabled={resending}>{resending ? "Đang gửi…" : "Gửi lại email xác nhận"}</button>}
                  <button className="account-submit" type="submit" disabled={loading}>{loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
                </form>
              </div>
            </div>
          )}
        </section>
        <footer className="account-bottom"><b>●</b> SYSTEM ONLINE / CUSTOMER ACCOUNT / UPTHINK 2026</footer>
      </div>
    </main>
  );
}
