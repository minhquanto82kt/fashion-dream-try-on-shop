import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const LINKS = [
  { to: "/shop", label: "Collections" },
  { to: "/ai", label: "AI Studio" },
  { to: "/about", label: "About" },
] as const;

export function SiteNav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fashion-nav" aria-label="Main navigation">
      <div className="fashion-nav__inner">
        <Link to="/" className="fashion-brand" aria-label="UPTHINK home">
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
            <Sparkles size={14} aria-hidden="true" />
            Try-on
          </Link>

          <Link
            to="/cart"
            className="fashion-cart-btn"
            aria-label={`Giỏ hàng${count > 0 ? `, ${count} sản phẩm` : ""}`}
          >
            <ShoppingBag size={17} aria-hidden="true" />
            {count > 0 && <span>{count}</span>}
          </Link>

          <button
            type="button"
            className="fashion-mobile-btn"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="fashion-mobile-menu">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}

          <Link to="/ai" onClick={() => setOpen(false)}>
            AI Try-On ↗
          </Link>

          <Link to="/cart" onClick={() => setOpen(false)}>
            Cart / {String(count).padStart(2, "0")}
          </Link>
        </div>
      )}
    </nav>
  );
}
