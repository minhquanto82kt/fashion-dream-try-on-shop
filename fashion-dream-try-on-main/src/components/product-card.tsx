import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart } from "lucide-react";
import { formatVnd, type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="fashion-product-card">
      <Link to="/product/$id" params={{ id: product.id }} className="fashion-product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="fashion-product-badge">{product.badge}</span>}
        <span className="fashion-product-index">/{product.id.toUpperCase()}</span>
        <span className="fashion-product-arrow"><ArrowUpRight size={16} /></span>
      </Link>
      <div className="fashion-product-meta">
        <div>
          <p className="fashion-product-category">{product.category}</p>
          <Link to="/product/$id" params={{ id: product.id }} className="fashion-product-title">
            {product.name}
          </Link>
          <p className="fashion-product-spec">{product.sizes.join(" / ")} · {product.colors.slice(0, 2).join(" / ")}</p>
        </div>
        <div className="fashion-product-price-wrap">
          <span className="fashion-product-price">{formatVnd(product.price)}</span>
          <button aria-label={`Lưu ${product.name}`} className="fashion-heart" onClick={(e) => e.preventDefault()}>
            <Heart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
