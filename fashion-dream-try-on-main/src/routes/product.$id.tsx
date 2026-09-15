import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { type Product, formatVnd } from "@/data/products";
import { useCart } from "@/lib/cart";

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

type ProductDetailResult = {
  product: Product;
  variants: DbVariant[];
  related: Product[];
};

const getProductDetail = createServerFn({ method: "GET" })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    const { supabaseRequest } = await import("@/lib/supabase.server");

    const [products, variants, images] = await Promise.all([
      supabaseRequest<DbProduct[]>(
        `products?id=eq.${encodeURIComponent(productId)}&active=eq.true&status=eq.published&select=id,name,description,price,category,image,active,status,featured`,
      ),
      supabaseRequest<DbVariant[]>(
        `product_variants?product_id=eq.${encodeURIComponent(productId)}&select=id,product_id,size,color,stock&order=size.asc`,
      ),
      supabaseRequest<DbImage[]>(
        `product_images?product_id=eq.${encodeURIComponent(productId)}&select=id,product_id,image_url,sort_order,is_primary&order=sort_order.asc`,
      ),
    ]);

    const dbProduct = products[0];

    if (!dbProduct) return null;

    const gallery = images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => image.image_url);

    const primaryImage =
      images.find((image) => image.is_primary)?.image_url ??
      gallery[0] ??
      dbProduct.image ??
      "";

    const product: Product = {
      id: dbProduct.id,
      name: dbProduct.name,
      price: Number(dbProduct.price),
      category: dbProduct.category,
      image: primaryImage,
      gallery: gallery.length > 0 ? gallery : [primaryImage],
      sizes: Array.from(new Set(variants.map((variant) => variant.size))),
      colors: Array.from(new Set(variants.map((variant) => variant.color))),
      badge: dbProduct.featured ? "Featured" : undefined,
      description: dbProduct.description,
    };

    const relatedProducts = await supabaseRequest<DbProduct[]>(
      `products?active=eq.true&status=eq.published&id=neq.${encodeURIComponent(productId)}&select=id,name,description,price,category,image,active,status,featured&order=created_at.desc&limit=3`,
    );

    const related: Product[] = relatedProducts.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      category: item.category,
      image: item.image ?? "",
      gallery: [item.image ?? ""],
      sizes: [],
      colors: [],
      badge: item.featured ? "Featured" : undefined,
      description: item.description,
    }));

    return { product, variants, related } satisfies ProductDetailResult;
  });

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => getProductDetail({ data: params.id }),

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Không tìm thấy sản phẩm | UpThink" },
          { name: "robots", content: "noindex" },
        ],
      };
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
  const data = Route.useLoaderData();

  if (!data) throw notFound();

  const { product, variants, related } = data;
  const { add } = useCart();
  const initialVariant = variants.find((variant) => variant.stock > 0) ?? variants[0];

  const [size, setSize] = useState(initialVariant?.size ?? "");
  const [color, setColor] = useState(initialVariant?.color ?? "");
  const [quantity, setQuantity] = useState(1);
  const [shot, setShot] = useState(product.gallery[0] ?? product.image);

  const selectedVariant = variants.find(
    (variant) => variant.size === size && variant.color === color,
  );

  const stock = selectedVariant?.stock ?? 0;
  const outOfStock = !selectedVariant || stock <= 0;
  const hasVariants = variants.length > 0;
  const maxQuantity = Math.min(99, Math.max(1, stock));

  const isSizeAvailable = (candidateSize: string) =>
    variants.some(
      (variant) =>
        variant.size === candidateSize &&
        variant.color === color &&
        variant.stock > 0,
    );

  const isColorAvailable = (candidateColor: string) =>
    variants.some(
      (variant) =>
        variant.color === candidateColor &&
        variant.size === size &&
        variant.stock > 0,
    );

  function selectSize(nextSize: string) {
    setSize(nextSize);
    setQuantity(1);

    const matchingVariant = variants.find(
      (variant) =>
        variant.size === nextSize &&
        variant.color === color &&
        variant.stock > 0,
    );

    if (!matchingVariant) {
      const fallback = variants.find(
        (variant) => variant.size === nextSize && variant.stock > 0,
      );
      setColor(fallback?.color ?? "");
    }
  }

  function selectColor(nextColor: string) {
    setColor(nextColor);
    setQuantity(1);

    const matchingVariant = variants.find(
      (variant) =>
        variant.color === nextColor &&
        variant.size === size &&
        variant.stock > 0,
    );

    if (!matchingVariant) {
      const fallback = variants.find(
        (variant) => variant.color === nextColor && variant.stock > 0,
      );
      setSize(fallback?.size ?? "");
    }
  }

  function changeQuantity(delta: number) {
    if (outOfStock) return;
    setQuantity((current) => Math.min(maxQuantity, Math.max(1, current + delta)));
  }

  function addToCart() {
    if (!selectedVariant || outOfStock) return;

    add({
      productId: product.id,
      size: selectedVariant.size,
      color: selectedVariant.color,
      qty: quantity,
    });

    toast.success(
      `Đã thêm ${product.name} (${selectedVariant.size} / ${selectedVariant.color}) vào giỏ`,
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-12 lg:px-20">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-silver">
          <Link to="/shop" className="transition-colors hover:text-primary">
            Shop
          </Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="max-w-[240px] truncate text-beige">{product.name}</span>
        </div>

        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] lg:items-start">
          <div className="min-w-0">
            <div className="overflow-hidden border border-border bg-card">
              <img
                src={shot}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>

            <div className="mt-4 flex max-w-full gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {product.gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setShot(image)}
                  className={`size-20 shrink-0 overflow-hidden border transition-colors ${
                    image === shot ? "border-primary" : "border-border hover:border-primary"
                  }`}
                  aria-label={`Chọn ảnh sản phẩm ${index + 1}`}
                  aria-current={image === shot}
                >
                  <img src={image} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <div className="border-b border-border pb-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{product.category}</p>
                  <h1 className="mt-3 max-w-2xl text-4xl leading-tight sm:text-5xl">
                    {product.name}
                  </h1>
                </div>
                {product.badge && (
                  <span className="shrink-0 border border-primary px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-primary">
                    {product.badge}
                  </span>
                )}
              </div>

              <p className="mt-5 font-display text-2xl leading-tight text-primary">
                {formatVnd(product.price)}
              </p>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-beige">
                {product.description}
              </p>
            </div>

            <div className="py-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-silver">Size</p>
                {size && <span className="text-xs text-primary">{size}</span>}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const available = isSizeAvailable(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      onClick={() => selectSize(s)}
                      className={`min-h-10 border px-4 py-2 text-sm transition-colors ${
                        s === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-beige hover:border-primary"
                      } ${!available ? "cursor-not-allowed opacity-30" : ""}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.2em] text-silver">Màu</p>
                {color && <span className="text-xs text-primary">{color}</span>}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const available = isColorAvailable(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={!available}
                      onClick={() => selectColor(c)}
                      className={`min-h-10 border px-4 py-2 text-sm transition-colors ${
                        c === color
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-beige hover:border-primary"
                      } ${!available ? "cursor-not-allowed opacity-30" : ""}`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                <div className="text-silver">
                  {!hasVariants ? (
                    "Biến thể sản phẩm chưa được cấu hình"
                  ) : outOfStock ? (
                    "Hết hàng cho biến thể này"
                  ) : stock <= 3 ? (
                    <span className="text-primary">Chỉ còn {stock} sản phẩm</span>
                  ) : (
                    `Còn ${stock} sản phẩm`
                  )}
                </div>

                {!outOfStock && (
                  <div className="flex h-10 items-center border border-border">
                    <button
                      type="button"
                      onClick={() => changeQuantity(-1)}
                      disabled={quantity <= 1}
                      className="grid h-full w-10 place-items-center text-silver transition-colors hover:text-primary disabled:opacity-30"
                      aria-label="Giảm số lượng"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="grid h-full min-w-10 place-items-center border-x border-border text-sm text-beige">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(1)}
                      disabled={quantity >= maxQuantity}
                      className="grid h-full w-10 place-items-center text-silver transition-colors hover:text-primary disabled:opacity-30"
                      aria-label="Tăng số lượng"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-7 grid gap-3">
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={addToCart}
                  className="min-h-12 w-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {outOfStock ? "Hết hàng" : `Thêm ${quantity} vào giỏ`}
                </button>

                <Link
                  to="/ai"
                  search={{ product: product.id }}
                  className="flex min-h-12 w-full items-center justify-center border border-primary px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  AI TRY-ON (BETA)
                </Link>
              </div>
            </div>

            <div className="border-t border-border pt-6 text-sm leading-6 text-silver">
              <p>Giao hàng toàn quốc 2–4 ngày · Miễn phí cho đơn từ 1.000.000₫</p>
              <p className="mt-2">Đổi size trong 7 ngày · Hỗ trợ qua Instagram @upthink.iuh</p>
            </div>
          </div>
        </div>

        <section className="mt-20 border-t border-border pt-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">More from the collection</p>
              <h2 className="mt-3 text-2xl leading-tight sm:text-3xl">Có thể bạn thích</h2>
            </div>
            <Link
              to="/shop"
              className="hidden text-xs uppercase tracking-[0.15em] text-primary hover:underline sm:block"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
