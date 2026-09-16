import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getCustomerSession } from "@/lib/auth";
import { supabaseConfig } from "@/lib/upthink-supabase";
import { listWishlistProductIds, removeFromWishlist } from "@/lib/wishlist";
import { formatPrice, useI18n } from "@/lib/i18n";
import { PRODUCTS, type Product as LocalProduct } from "@/data/products";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "Yêu thích | WEARO" },
      { name: "description", content: "Các sản phẩm bạn đã lưu vào danh sách yêu thích của WEARO." },
    ],
  }),
  component: WishlistPage,
});

type WishlistProduct = LocalProduct;

function getPreviewUserId() {
  if (typeof window === "undefined") return null;
  if (new URLSearchParams(window.location.search).get("preview") !== "1") return null;
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("-git-feature-product-admin-")) {
    return "preview-account-user";
  }
  return null;
}

async function loadProducts(ids: string[]): Promise<WishlistProduct[]> {
  if (ids.length === 0) return [];
  const uniqueIds = Array.from(new Set(ids));
  try {
    const query = uniqueIds.map((id) => encodeURIComponent(id)).join(",");
    const response = await fetch(
      `${supabaseConfig.url}/rest/v1/products?id=in.(${query})&active=eq.true&status=eq.published&select=id,name,description,price,category,image,featured`,
      { headers: { apikey: supabaseConfig.key, Authorization: `Bearer ${getCustomerSession()?.access_token ?? supabaseConfig.key}` } },
    );
    if (response.ok) {
      const rows = (await response.json()) as Array<{ id: string; name: string; description: string | null; price: number; category: WishlistProduct["category"]; image: string | null; featured: boolean }>;
      const byId = new Map(rows.map((row) => [row.id, row]));
      const dbProducts = uniqueIds.map((id) => byId.get(id)).filter(Boolean).map((row) => ({
        id: row!.id, name: row!.name, price: Number(row!.price), category: row!.category,
        image: row!.image ?? "", gallery: [row!.image ?? ""], sizes: [], colors: [],
        badge: row!.featured ? "Featured" : undefined, description: row!.description ?? "",
      }));
      if (dbProducts.length > 0) return dbProducts;
    }
  } catch {
    // Preview/local catalogue fallback.
  }
  return uniqueIds.map((id) => PRODUCTS.find((product) => product.id === id)).filter(Boolean) as WishlistProduct[];
}

function WishlistPage() {
  const { language } = useI18n();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = getPreviewUserId() ?? getCustomerSession()?.user?.id;
      if (!userId) { setProducts([]); return; }
      const ids = await listWishlistProductIds(userId);
      setProducts(await loadProducts(ids));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách yêu thích.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    void loadWishlist();
    const onChanged = () => void loadWishlist();
    window.addEventListener("wearo:wishlist:changed", onChanged);
    window.addEventListener("upthink:auth:login", onChanged);
    window.addEventListener("upthink:auth:logout", onChanged);
    return () => {
      window.removeEventListener("wearo:wishlist:changed", onChanged);
      window.removeEventListener("upthink:auth:login", onChanged);
      window.removeEventListener("upthink:auth:logout", onChanged);
    };
  }, []);

  const handleRemove = async (productId: string) => {
    const userId = getPreviewUserId() ?? getCustomerSession()?.user?.id;
    if (!userId) return;
    setRemoving(productId);
    try {
      await removeFromWishlist(productId, userId);
      setProducts((current) => current.filter((product) => product.id !== productId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Không thể bỏ sản phẩm khỏi danh sách yêu thích.");
    } finally { setRemoving(null); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-10 lg:px-16">
        <header className="border-b border-border pb-8">
          <p className="eyebrow">WEARO / Wishlist</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">{language === "vi" ? <>Sản phẩm <span className="text-primary">yêu thích</span></> : <>Saved <span className="text-primary">pieces</span></>}</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-silver">{language === "vi" ? "Những sản phẩm bạn muốn giữ lại để xem, thử đồ hoặc mua sau." : "Pieces you want to keep for later, try on or purchase."}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.16em] text-silver">{products.length} {language === "vi" ? "sản phẩm" : "items"}</span>
          </div>
        </header>

        {loading ? (
          <section className="flex min-h-[48vh] items-center justify-center"><p className="eyebrow">WEARO / LOADING WISHLIST</p></section>
        ) : error ? (
          <section className="mt-8 border border-primary/40 px-6 py-12 text-center" role="alert"><p className="text-sm text-beige">{error}</p><button type="button" onClick={() => void loadWishlist()} className="mt-6 border border-primary px-5 py-3 text-xs uppercase tracking-[0.15em] text-primary">Thử lại</button></section>
        ) : products.length === 0 ? (
          <section className="flex min-h-[48vh] flex-col items-center justify-center border-b border-border py-20 text-center">
            <div className="grid size-16 place-items-center border border-border"><Heart className="size-6 text-primary" aria-hidden="true" /></div>
            <p className="eyebrow mt-7">EMPTY / SAVED LOOKS</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Chưa có sản phẩm yêu thích.</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-silver">Hãy bấm biểu tượng trái tim trên sản phẩm để lưu lại. Danh sách sẽ được đồng bộ với tài khoản của bạn.</p>
            <Link to="/shop" className="mt-7 inline-flex min-h-12 items-center gap-2 bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90">Khám phá sản phẩm <ArrowRight className="size-4" /></Link>
          </section>
        ) : (
          <section className="mt-8"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group overflow-hidden border border-border bg-card">
                <Link to="/product/$id" params={{ id: product.id }} className="relative block aspect-[4/5] overflow-hidden bg-muted"><img src={product.image} alt={product.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" /><span className="absolute left-3 top-3 border border-primary bg-background/85 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-primary">{product.category}</span></Link>
                <div className="p-5"><div className="flex items-start justify-between gap-4"><div><Link to="/product/$id" params={{ id: product.id }} className="text-lg font-medium transition-colors hover:text-primary">{product.name}</Link><p className="mt-2 text-sm text-primary">{formatPrice(product.price, language)}</p></div><button type="button" onClick={() => void handleRemove(product.id)} disabled={removing === product.id} className="grid size-10 shrink-0 place-items-center border border-border text-silver transition-colors hover:border-primary hover:text-primary disabled:opacity-40" aria-label={`Bỏ ${product.name} khỏi yêu thích`}><Trash2 className="size-4" /></button></div><Link to="/product/$id" params={{ id: product.id }} className="mt-5 flex min-h-11 items-center justify-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.13em] transition-colors hover:border-primary hover:text-primary"><ShoppingBag className="size-4" /> Xem sản phẩm</Link></div>
              </article>
            ))}
          </div></section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
