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

  const [cat, setCat] = useState<string>(() => {
    if (typeof window === "undefined") return "all";
    return new URLSearchParams(window.location.search).get("category") ?? "all";
  });
  const [sort, setSort] = useState<string>("featured");
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("search") ?? "";
  });

  const normalizedSearch = search.trim().toLowerCase();

  const list = [...products]
    .filter((p) => cat === "all" || p.category === cat)
    .filter((p) => {
      if (!normalizedSearch) return true;
      return [p.name, p.description, p.category].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    })
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : 0,
    );

  const selectCategory = (category: string) => {
    setCat(category);
    const params = new URLSearchParams(window.location.search);
    if (category === "all") params.delete("category");
    else params.set("category", category);
    window.history.replaceState(
      {},
      "",
      `/shop${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    window.history.replaceState(
      {},
      "",
      `/shop${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-12 lg:px-20">
        <p className="eyebrow">Collection 2026</p>

        <h1 className="mt-3 text-4xl leading-none sm:text-5xl">
          {normalizedSearch ? (
            <>
              Kết quả cho <span className="text-primary">“{search}”</span>
            </>
          ) : (
            <>
              {cat === "all" ? "Tất cả" : CATEGORIES.find((item) => item.slug === cat)?.name ?? "Danh mục"} {" "}
              <span className="text-primary">sản phẩm</span>
            </>
          )}
        </h1>

        {normalizedSearch && (
          <button
            type="button"
            onClick={clearSearch}
            className="mt-4 text-xs uppercase tracking-[0.15em] text-silver transition-colors hover:text-primary"
          >
            Xóa tìm kiếm
          </button>
        )}

        <div className="shop-controls mt-10 border-y border-border py-4">
          <div className="shop-category-scroll flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ slug: "all", name: "Tất cả" }, ...CATEGORIES].map((c) => (
              <button
                key={c.slug}
                onClick={() => selectCategory(c.slug)}
                className={`shop-category-button shrink-0 border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                  cat === c.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-beige hover:border-primary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="shop-sort mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 sm:mt-0 sm:border-t-0 sm:pt-0">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`shop-sort-button shrink-0 px-1 py-2 text-xs uppercase tracking-[0.15em] ${
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

        {list.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-10 border-y border-border py-16 text-center">
            <p className="eyebrow">No match</p>
            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
              Không tìm thấy sản phẩm phù hợp.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-silver">
              Thử một từ khóa khác hoặc quay lại toàn bộ sản phẩm.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-6 border border-primary px-4 py-3 text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
