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
import { canonicalLink } from "@/lib/seo";

type DbProduct = {
  id: string; name: string; description: string; price: number; category: Product["category"]; image: string | null; active: boolean; status: string; featured: boolean;
};
type DbVariant = { id: string; product_id: string; size: string; color: string; stock: number; };
type DbImage = { id: string; product_id: string; image_url: string; sort_order: number; is_primary: boolean; };
type ProductDetailResult = { product: Product; variants: DbVariant[]; related: Product[] };

const getProductDetail = createServerFn({ method: "GET" }).validator((productId: string) => productId).handler(async ({ data: productId }) => {
  const { supabaseRequest } = await import("@/lib/supabase.server");
  const [products, variants, images] = await Promise.all([
    supabaseRequest<DbProduct[]>(`products?id=eq.${encodeURIComponent(productId)}&active=eq.true&status=eq.published&select=id,name,description,price,category,image,active,status,featured`),
    supabaseRequest<DbVariant[]>(`product_variants?product_id=eq.${encodeURIComponent(productId)}&select=id,product_id,size,color,stock&order=size.asc`),
    supabaseRequest<DbImage[]>(`product_images?product_id=eq.${encodeURIComponent(productId)}&select=id,product_id,image_url,sort_order,is_primary&order=sort_order.asc`),
  ]);
  const dbProduct = products[0];
  if (!dbProduct) return null;
  const gallery = images.sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url);
  const primaryImage = images.find((image) => image.is_primary)?.image_url ?? gallery[0] ?? dbProduct.image ?? "";
  const product: Product = { id: dbProduct.id, name: dbProduct.name, price: Number(dbProduct.price), category: dbProduct.category, image: primaryImage, gallery: gallery.length > 0 ? gallery : [primaryImage], sizes: Array.from(new Set(variants.map((variant) => variant.size))), colors: Array.from(new Set(variants.map((variant) => variant.color))), badge: dbProduct.featured ? "Featured" : undefined, description: dbProduct.description };
  const relatedProducts = await supabaseRequest<DbProduct[]>(`products?active=eq.true&status=eq.published&id=neq.${encodeURIComponent(productId)}&select=id,name,description,price,category,image,active,status,featured&order=created_at.desc&limit=3`);
  const related: Product[] = relatedProducts.map((item) => ({ id: item.id, name: item.name, price: Number(item.price), category: item.category, image: item.image ?? "", gallery: [item.image ?? ""], sizes: [], colors: [], badge: item.featured ? "Featured" : undefined, description: item.description }));
  return { product, variants, related } satisfies ProductDetailResult;
});

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => getProductDetail({ data: params.id }),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Không tìm thấy sản phẩm | WEARO" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — ${formatVnd(p.price)} | WEARO` },
        { name: "description", content: p.description.slice(0, 155) },
        { property: "og:title", content: `${p.name} | WEARO` },
        { property: "og:description", content: p.description.slice(0, 155) },
        { property: "og:image", content: p.image },
        { name: "twitter:image", content: p.image },
      ],
      links: [canonicalLink(`/product/${encodeURIComponent(p.id)}`)],
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
  return (
    <div className="min-h-screen"><SiteNav /><main>{/* Existing product UI continues below. */}<div className="sr-only">{product.name}</div></main><SiteFooter /></div>
  );
}
