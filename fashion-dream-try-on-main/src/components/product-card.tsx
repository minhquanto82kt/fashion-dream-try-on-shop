import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import type { Product } from "@/data/products";
import { formatPrice, useI18n } from "@/lib/i18n";
import { getCustomerSession } from "@/lib/auth";
import { toggleWishlist, isWishlisted } from "@/lib/wishlist";

export function ProductCard({ product }: { product: Product }) {
  const { language } = useI18n();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const userId = getCustomerSession()?.user?.id;
      if (!userId) {
        if (mounted) setSaved(false);
        return;
      }
      try {
        const value = await isWishlisted(product.id, userId);
        if (mounted) setSaved(value);
      } catch {
        if (mounted) setSaved(false);
      }
    };
    void sync();
    const onChanged = () => void sync();
    window.addEventListener("wearo:wishlist:changed", onChanged);
    window.addEventListener("upthink:auth:login", onChanged);
    window.addEventListener("upthink:auth:logout", onChanged);
    return () => {
      mounted = false;
      window.removeEventListener("wearo:wishlist:changed", onChanged);
      window.removeEventListener("upthink:auth:login", onChanged);
      window.removeEventListener("upthink:auth:logout", onChanged);
    };
  }, [product.id]);

  const handleWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const userId = getCustomerSession()?.user?.id;
    if (!userId) {
      window.location.href = `/account?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const next = await toggleWishlist(product.id, userId);
      setSaved(next);
    } catch (error) {
      console.error("Wishlist update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="fashion-product-card">
      <Link to="/product/$id" params={{ id: product.id }} className="fashion-product-image">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {product.badge && <span className="fashion-product-badge">{product.badge}</span>}
        <span className="fashion-product-index">/{product.id.toUpperCase()}</span>
        <span className="fashion-product-arrow"><ArrowUpRight size={16} /></span>
      </Link>
      <div className="fashion-product-meta">
        <div>
          <p className="fashion-product-category">{product.category}</p>
          <Link to="/product/$id" params={{ id: product.id }} className="fashion-product-title">{product.name}</Link>
          <p className="fashion-product-spec">{product.sizes.join(" / ")} · {product.colors.slice(0, 2).join(" / ")}</p>
        </div>
        <div className="fashion-product-price-wrap">
          <span className="fashion-product-price">{formatPrice(product.price, language)}</span>
          <button
            type="button"
            aria-label={saved ? (language === "vi" ? `Bỏ lưu ${product.name}` : `Remove ${product.name}`) : (language === "vi" ? `Lưu ${product.name}` : `Save ${product.name}`)}
            aria-pressed={saved}
            disabled={saving}
            className={`fashion-heart ${saved ? "is-saved" : ""}`}
            onClick={handleWishlist}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </article>
  );
}
