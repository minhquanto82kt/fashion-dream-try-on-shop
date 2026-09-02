import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS, formatVnd, getProduct } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Không tìm thấy sản phẩm | UpThink" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — ${formatVnd(p.price)} | UpThink` },
        { name: "description", content: p.description.slice(0, 155) },
        { property: "og:title", content: `${p.name} | UpThink` },
        { property: "og:description", content: p.description.slice(0, 155) },
        { property: "og:image", content: p.image },
        { name: "twitter:image", content: p.image },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0]!);
  const [color, setColor] = useState(product.colors[0]!);
  const [shot, setShot] = useState(product.gallery[0]!);

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-12 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <img
              src={shot}
              alt={product.name}
              className="aspect-[4/5] w-full border border-border object-cover"
            />
            <div className="mt-4 flex gap-3">
              {product.gallery.map((g) => (
                <button
                  key={g}
                  onClick={() => setShot(g)}
                  className={`size-20 border ${g === shot ? "border-primary" : "border-border"}`}
                >
                  <img src={g} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">{product.category}</p>
            <h1 className="mt-3 text-4xl leading-none">{product.name}</h1>
            <p className="mt-4 font-display text-2xl text-primary">{formatVnd(product.price)}</p>
            <p className="mt-6 text-beige">{product.description}</p>

            <p className="mt-8 text-xs uppercase tracking-[0.2em] text-silver">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`border px-4 py-2 text-sm ${
                    s === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-beige hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-silver">Màu</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`border px-4 py-2 text-sm ${
                    c === color
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-beige hover:border-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  add({ productId: product.id, size, color, qty: 1 });
                  toast.success(`Đã thêm ${product.name} (${size}) vào giỏ`);
                }}
                className="bg-primary px-8 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Thêm vào giỏ
              </button>
              <Link
                to="/ai"
                search={{ product: product.id }}
                className="border border-border px-8 py-3 text-xs uppercase tracking-[0.15em] text-beige hover:border-primary"
              >
                Thử đồ ảo với AI
              </Link>
            </div>

            <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-silver">
              <p>Giao hàng toàn quốc 2–4 ngày · Miễn phí cho đơn từ 1.000.000₫</p>
              <p>Đổi size trong 7 ngày · Hỗ trợ qua Instagram @upthink.iuh</p>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl">Có thể bạn thích</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
