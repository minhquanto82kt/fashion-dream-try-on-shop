import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, Sparkles, UserRound, X, LogOut } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { getCustomerUser, signOutCustomer } from "@/lib/auth";

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/ai", label: "AI Studio" },
  { to: "/about", label: "About" },
] as const;

export function SiteNav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const user = await getCustomerUser();
      if (mounted) setCustomerEmail(user?.email ?? null);
    };
    void sync();
    const onLogin = () => void sync();
    const onLogout = () => setCustomerEmail(null);
    window.addEventListener("upthink:auth:login", onLogin);
    window.addEventListener("upthink:auth:logout", onLogout);
    return () => {
      mounted = false;
      window.removeEventListener("upthink:auth:login", onLogin);
      window.removeEventListener("upthink:auth:logout", onLogout);
    };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    window.location.href = `/shop?search=${encodeURIComponent(value)}`;
    setSearchOpen(false);
    setOpen(false);
  };

  const closeMenus = () => { setOpen(false); setSearchOpen(false); };

  const handleLogout = async () => {
    await signOutCustomer();
    closeMenus();
  };

  return (
    <nav className="fashion-nav" aria-label="Điều hướng chính">
      <div className="fashion-nav__inner">
        <Link to="/" className="fashion-brand" aria-label="UpThink home">
          <span className="fashion-brand__mark">U</span>
          <span className="fashion-brand__copy">
            <span className="fashion-brand__name">UPTHINK<span>.</span></span>
            <span className="fashion-brand__meta">AI FASHION / 2026</span>
          </span>
        </Link>

        <div className="fashion-nav__links">
          {LINKS.map((link) => <Link key={link.to} to={link.to} activeProps={{ className: "is-active" }}>{link.label}</Link>)}
        </div>

        <div className="fashion-nav__actions">
          <button type="button" className={`fashion-icon-btn ${searchOpen ? "is-active" : ""}`} aria-label={searchOpen ? "Đóng tìm kiếm" : "Tìm kiếm sản phẩm"} aria-expanded={searchOpen} onClick={() => { setSearchOpen((value) => !value); setOpen(false); }}>
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>
          <Link to="/ai" className="fashion-ai-btn"><Sparkles size={14} /><span>AI Try-On</span><span className="fashion-beta-label">BETA</span></Link>
          <Link to="/account" className="fashion-cart-btn fashion-account-btn" aria-label={customerEmail ? `Tài khoản ${customerEmail}` : "Tài khoản"} title={customerEmail ?? "Tài khoản"}><UserRound size={17} /></Link>
          {customerEmail && <button type="button" className="fashion-icon-btn" aria-label="Đăng xuất" title="Đăng xuất" onClick={() => void handleLogout()}><LogOut size={16} /></button>}
          <Link to="/cart" className="fashion-cart-btn" aria-label="Giỏ hàng"><ShoppingBag size={17} />{count > 0 && <span>{count}</span>}</Link>
          <button type="button" className="fashion-mobile-btn" aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open} onClick={() => { setOpen((value) => !value); setSearchOpen(false); }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {searchOpen && <div className="fashion-search-panel"><form onSubmit={submitSearch} className="fashion-search-form"><label htmlFor="site-search" className="sr-only">Tìm kiếm sản phẩm</label><Search size={17} aria-hidden="true" /><input id="site-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm, phong cách..." autoFocus /><button type="submit">Search</button></form></div>}

      {open && <div className="fashion-mobile-menu">
        {LINKS.map((link) => <Link key={link.to} to={link.to} onClick={closeMenus}>{link.label}</Link>)}
        <button type="button" onClick={() => { setOpen(false); setSearchOpen(true); }}>Search</button>
        <Link to="/ai" onClick={closeMenus}>AI Try-On <span className="fashion-beta-label">BETA</span> ↗</Link>
        <Link to="/account" onClick={closeMenus}>Account ↗</Link>
        {customerEmail && <button type="button" onClick={() => void handleLogout()}>Logout / {customerEmail}</button>}
        <Link to="/cart" onClick={closeMenus}>Cart / {String(count).padStart(2, "0")}</Link>
      </div>}
    </nav>
  );
}
