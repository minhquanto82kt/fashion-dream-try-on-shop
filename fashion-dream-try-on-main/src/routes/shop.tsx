```tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, type Product } from "@/data/products";

type DbProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Product["category"];
  image: string | null;
  active: boolean;
  status: string;
  featured: boolean;
};

type DbVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
};

type DbImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

const getShopProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseRequest } = await import("@/lib/supabase.server");

    const [products, variants, images] = await Promise.all([
      supabaseRequest<DbProduct[]>(
        "products?active=eq.true&status=eq.published&select=id,name,description,price,category,image,active,status,featured&order=created_at.desc",
      ),
      supabaseRequest<DbVariant[]>(
        "product_variants?select=id,product_id,size,color,stock&order=size.asc",
      ),
      supabaseRequest<DbImage[]>(
        "product_images?select=id,product_id,image_url,sort_order,is_primary&order=sort_order.asc",
      ),
    ]);

    return products.map((product): Product => {
      const productVariants = variants.filter(
        (variant) => variant.product_id === product.id,
      );

      const productImages = images
        .filter((image) => image.product_id === product.id)
        .sort((a, b) => a.sort_order - b.sort_order);

      const sizes = Array.from(
        new Set(productVariants.map((variant) => variant.size)),
      );

      const colors = Array.from(
        new Set(productVariants.map((variant) => variant.color)),
      );

      const gallery = productImages.map((image) => image.image_url);

      const primaryImage =
        productImages.find((image) => image.is_primary)?.image_url ??
        gallery[0] ??
        product.image ??
        "";

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.category,
        image: primaryImage,
        gallery: gallery.length > 0 ? gallery : [primaryImage],
        sizes,
        colors,
        badge: product.featured ? "Featured" : undefined,
        description: product.description,
      };
    });
  },
);

export const Route = createFileRoute("/shop")({
  loader: () => getShopProducts(),
  head: () => ({
    meta: [
      { title: "Cửa hàng — Streetwear cá nhân hóa | UpThink" },
      {
        name: "description",
        content:
          "Hoodie, tee, outerwear và phụ kiện UpThink. Chọn size, thử đồ ảo bằng AI rồi đặt hàng trong vài phút.",
      },
      { property: "og:title", content: "Cửa hàng UpThink" },
      {
        property: "og:description",
        content: "Bộ sưu tập streetwear UpThink với AI virtual try-on.",
      },
    ],
  }),
  component: ShopPage,
});

const SORTS = [
  { id: "featured", label: "Nổi bật" },
  { id: "price-asc", label: "Giá thấp → cao" },
  { id: "price-desc", label: "Giá cao → thấp" },
] as const;

function ShopPage() {
  const products = Route.useLoaderData();

  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<string>("featured");

  const list = [...products]
    .filter((p) => cat === "all" || p.category === cat)
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : 0,
    );

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-12 lg:px-20">
        <p className="eyebrow">Collection 2026</p>

        <h1 className="mt-3 text-4xl leading-none sm:text-5xl">
          Tất cả <span className="text-primary">sản phẩm</span>
        </h1>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          <div className="flex flex-wrap gap-2">
            {[{ slug: "all", name: "Tất cả" }, ...CATEGORIES].map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                  cat === c.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-beige hover:border-primary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`text-xs uppercase tracking-[0.15em] ${
                  sort === s.id
                    ? "text-primary"
                    : "text-silver hover:text-beige"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
```
