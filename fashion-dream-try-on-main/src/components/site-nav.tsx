import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const LINKS = [
  { to: "/shop", label: "Collections" },
  { to: "/ai", label: "AI Lab" },
  { to: "/about", label: "About" },
] as const;

export function SiteNav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fashion-nav">
      <div className="fashion-nav__inner">
        <Link to="/" className="fashion-brand" aria-label="UpThink home">
          <span className="fashion-brand__mark">U</span>
          <span className="fashion-brand__copy">
            <span className="fashion-brand__name">
              UPTHINK<span>.</span>
            </span>
            <span className="fashion-brand__meta">AI FASHION / 2026</span>
          </span>
        </Link>

        <div className="fashion-nav__links">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "is-active" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="fashion-nav__actions">
          <Link to="/ai" className="fashion-ai-btn">
            <Sparkles size={14} /> Try-on
          </Link>
          <Link to="/cart" className="fashion-cart-btn" aria-label="Giỏ hàng">
            <ShoppingBag size={17} />
            {count > 0 && <span>{count}</span>}
          </Link>
          <button
            className="fashion-mobile-btn"
            aria-label="Mở menu"
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fashion-mobile-menu" id="site-mobile-menu">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link to="/ai" onClick={() => setOpen(false)}>AI Try-On ↗</Link>
          <Link to="/cart" onClick={() => setOpen(false)}>Cart / {String(count).padStart(2, "0")}</Link>
        </div>
      )}
    </nav>
  );
}
