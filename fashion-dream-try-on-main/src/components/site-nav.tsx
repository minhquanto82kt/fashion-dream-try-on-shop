import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  Info,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { getCustomerUser, signOutCustomer } from "@/lib/auth";

const PRIMARY_LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/ai", label: "AI Try-On", beta: true },
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

  const closeMenus = () => {
    setOpen(false);
    setSearchOpen(false);
  };

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

        <div className="fashion-nav__links" aria-label="Điều hướng trang chính">
          {PRIMARY_LINKS.map((link) => (
            <Link key={link.to} to={link.to} activeProps={{ className: "is-active" }}>
              {link.label}
              {link.beta && <span className="fashion-beta-label">BETA</span>}
            </Link>
          ))}
        </div>

        <div className="fashion-nav__actions">
          <button
            type="button"
            className={`fashion-icon-btn ${searchOpen ? "is-active" : ""}`}
            aria-label={searchOpen ? "Đóng tìm kiếm" : "Tìm kiếm sản phẩm"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((value) => !value);
              setOpen(false);
            }}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          <Link
            to="/account"
            className="fashion-icon-btn fashion-account-btn"
            aria-label={customerEmail ? `Tài khoản ${customerEmail}` : "Tài khoản"}
            title={customerEmail ?? "Tài khoản"}
          >
            <UserRound size={18} />
          </Link>

          <Link to="/cart" className="fashion-cart-btn" aria-label="Giỏ hàng">
            <ShoppingBag size={18} />
            {count > 0 && <span>{count}</span>}
          </Link>

          {customerEmail && (
            <button
              type="button"
              className="fashion-icon-btn fashion-logout-btn"
              aria-label="Đăng xuất"
              title="Đăng xuất"
              onClick={() => void handleLogout()}
            >
              <LogOut size={17} />
            </button>
          )}

          <button
            type="button"
            className={`fashion-mobile-btn ${open ? "is-active" : ""}`}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              setSearchOpen(false);
            }}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="fashion-search-panel">
          <form onSubmit={submitSearch} className="fashion-search-form">
            <label htmlFor="site-search" className="sr-only">Tìm kiếm sản phẩm</label>
            <Search size={18} aria-hidden="true" />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm sản phẩm, phong cách..."
              autoFocus
            />
            <button type="submit">Search</button>
          </form>
        </div>
      )}

      {open && (
        <div className="fashion-mobile-menu" role="dialog" aria-label="UPTHINK menu">
          <div className="fashion-menu-header">
            <div>
              <span className="fashion-menu-kicker">UPTHINK / NAVIGATION</span>
              <h2>Discover</h2>
            </div>
            <span className="fashion-menu-status">SYS 02 // ONLINE</span>
          </div>

          <div className="fashion-menu-grid">
            <section className="fashion-menu-section">
              <span className="fashion-menu-label">01 / EXPLORE</span>
              <Link to="/shop" onClick={closeMenus}>
                <span><strong>Shop</strong><small>Browse the collection</small></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/ai" onClick={closeMenus}>
                <span><strong>Style Lab</strong><small>Experiment with your look</small></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </section>

            <section className="fashion-menu-section">
              <span className="fashion-menu-label">02 / YOUR SPACE</span>
              <Link to="/account/wishlist" onClick={closeMenus}>
                <span><strong>Saved Looks</strong><small>Your saved fashion picks</small></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/account/orders" onClick={closeMenus}>
                <span><strong>My Orders</strong><small>Track your purchases</small></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/account" onClick={closeMenus}>
                <span><strong>My Account</strong><small>Profile and preferences</small></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </section>

            <section className="fashion-menu-section fashion-menu-section--info">
              <span className="fashion-menu-label">03 / INFORMATION</span>
              <Link to="/about" onClick={closeMenus}>
                <span><Info size={15} aria-hidden="true" /><strong>About UpThink</strong></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/about" onClick={closeMenus}>
                <span><BookOpen size={15} aria-hidden="true" /><strong>How It Works</strong></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
              <button type="button" onClick={() => { setOpen(false); setSearchOpen(true); }}>
                <span><Search size={15} aria-hidden="true" /><strong>Search</strong></span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
              <Link to="/about" onClick={closeMenus}>
                <span><CircleHelp size={15} aria-hidden="true" /><strong>FAQ / Support</strong></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </section>
          </div>

          <div className="fashion-menu-footer">
            <span>UPTHINK / IUH — SAIGON 2026</span>
            <span>AI FASHION SYSTEM</span>
          </div>
        </div>
      )}
    </nav>
  );
}
