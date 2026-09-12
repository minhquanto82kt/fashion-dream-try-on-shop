import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
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
import { CATEGORIES } from "@/data/products";
import { useCart } from "@/lib/cart";
import { getCustomerUser, signOutCustomer } from "@/lib/auth";

const PRIMARY_LINKS = [
  { to: "/ai", label: "AI Studio", beta: true },
  { to: "/about", label: "About" },
] as const;

const TOPBAR_TEXT_STYLE = {
  fontSize: "13px",
  lineHeight: 1,
  fontWeight: 600,
  letterSpacing: ".13em",
} as const;

export function SiteNav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
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
    setShopOpen(false);
  };

  const closeMenus = () => {
    setOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
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
          <div className={`fashion-shop-nav ${shopOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="fashion-nav-link fashion-shop-trigger"
              aria-expanded={shopOpen}
              aria-haspopup="true"
              onClick={() => {
                setShopOpen((value) => !value);
                setSearchOpen(false);
                setOpen(false);
              }}
              style={TOPBAR_TEXT_STYLE}
            >
              <span>Shop</span>
              <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
            </button>

            {shopOpen && (
              <div className="fashion-shop-mega" role="dialog" aria-label="Shop categories">
                <div className="fashion-shop-mega__intro">
                  <span className="fashion-menu-kicker">COLLECTION / 2026</span>
                  <h2>Shop by category</h2>
                  <Link to="/shop" onClick={closeMenus} className="fashion-shop-all">
                    View all products <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                </div>

                <div className="fashion-shop-category-grid">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category.slug}
                      to="/shop"
                      search={{ category: category.slug }}
                      onClick={closeMenus}
                      className="fashion-shop-category"
                    >
                      <span className="fashion-shop-category__image">
                        <img src={category.image} alt="" loading="lazy" />
                      </span>
                      <span className="fashion-shop-category__meta">
                        <strong>{category.name}</strong>
                        <span>Explore category</span>
                      </span>
                      <ChevronRight size={15} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {PRIMARY_LINKS.map((link) =>
            link.beta ? (
              <div
                key={link.to}
                className="fashion-ai-nav"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}
              >
                <span
                  className="fashion-ai-nav__beta"
                  style={{
                    color: "var(--primary)",
                    fontFamily: "var(--ft-meta)",
                    fontSize: "8px",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: ".18em",
                    textAlign: "center",
                    textTransform: "uppercase",
                    minHeight: "8px",
                  }}
                >
                  BETA
                </span>
                <Link
                  to={link.to}
                  className="fashion-ai-nav__button"
                  activeProps={{ className: "fashion-ai-nav__button is-active" }}
                  aria-label="AI Studio — Beta"
                  style={{
                    minHeight: "36px",
                    padding: "0 15px",
                    border: "1px solid var(--primary)",
                    color: "var(--foreground)",
                    opacity: 1,
                    letterSpacing: ".1em",
                    fontSize: "13px",
                    lineHeight: 1,
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {link.label}
                </Link>
              </div>
            ) : (
              <Link key={link.to} to={link.to} activeProps={{ className: "is-active" }} style={TOPBAR_TEXT_STYLE}>
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="fashion-nav__actions">
          <button
            type="button"
            className={`fashion-icon-btn fashion-search-toggle ${searchOpen ? "is-active" : ""}`}
            aria-label={searchOpen ? "Đóng tìm kiếm" : "Tìm kiếm sản phẩm"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((value) => !value);
              setOpen(false);
              setShopOpen(false);
            }}
          >
            {searchOpen ? <X size={21} strokeWidth={2} /> : <Search size={21} strokeWidth={2} />}
          </button>

          <Link
            to="/account"
            className="fashion-icon-btn fashion-account-btn"
            aria-label={customerEmail ? `Tài khoản ${customerEmail}` : "Tài khoản"}
            title={customerEmail ?? "Tài khoản"}
          >
            <UserRound size={21} strokeWidth={2} />
          </Link>

          <Link to="/cart" className="fashion-cart-btn" aria-label="Giỏ hàng">
            <ShoppingBag size={21} strokeWidth={2} />
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
              <LogOut size={20} strokeWidth={2} />
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
              setShopOpen(false);
            }}
          >
            {open ? <X size={23} strokeWidth={2} /> : <Menu size={23} strokeWidth={2} />}
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
