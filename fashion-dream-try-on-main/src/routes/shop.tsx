import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, type Product } from "@/data/products";
import { canonicalLink } from "@/lib/seo";

type DbCatalogProduct = { id: string; name: string; description: string; price: number; category: Product["category"]; image: string | null; featured: boolean; sizes: string[]; colors: string[]; gallery: string[]; total_stock: number; };

const getShopProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseRequest } = await import("@/lib/supabase.server");
  const rows = await supabaseRequest<DbCatalogProduct[]>("rpc/get_published_catalog", { method: "POST", body: "{}" });
  return rows.map((product): Product => { const gallery = product.gallery ?? []; const primaryImage = gallery[0] ?? product.image ?? ""; return { id: product.id, name: product.name, price: Number(product.price), category: product.category, image: primaryImage, gallery: gallery.length > 0 ? gallery : [primaryImage], sizes: product.sizes ?? [], colors: product.colors ?? [], badge: product.featured ? "Featured" : undefined, description: product.description }; });
});

export const Route = createFileRoute("/shop")({
  staleTime: 30_000,
  loader: () => getShopProducts(),
  head: () => ({ meta: [
    { title: "Cửa hàng WEARO — Casual, Modern & Unisex" },
    { name: "description", content: "Khám phá catalogue WEARO: thời trang casual, hiện đại và unisex cho nam và nữ. Chọn size, thử đồ ảo bằng AI và hoàn thiện outfit theo phong cách riêng." },
    { property: "og:title", content: "Cửa hàng WEARO — Casual, Modern & Unisex" },
    { property: "og:description", content: "WEARO / Modern everyday fashion for everyone — khám phá sản phẩm, AI Virtual Try-On và AI Personal Stylist." },
  ], links: [canonicalLink("/shop")] }),
  component: ShopPage,
});

const SORTS = [{ id: "featured", label: "Nổi bật" }, { id: "price-asc", label: "Giá thấp → cao" }, { id: "price-desc", label: "Giá cao → thấp" }] as const;

function ShopPage() {
  const products = Route.useLoaderData();
  const [cat, setCat] = useState<string>(() => { if (typeof window === "undefined") return "all"; return new URLSearchParams(window.location.search).get("category") ?? "all"; });
  const [sort, setSort] = useState<string>("featured");
  const [search, setSearch] = useState(() => { if (typeof window === "undefined") return ""; return new URLSearchParams(window.location.search).get("search") ?? ""; });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();
  const list = useMemo(() => [...products].filter((product) => cat === "all" || product.category === cat).filter((product) => { if (!normalizedSearch) return true; return [product.name, product.description, product.category].some((value) => value.toLowerCase().includes(normalizedSearch)); }).sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0), [products, cat, normalizedSearch, sort]);
  const updateUrl = (next: { category?: string; search?: string }) => { const params = new URLSearchParams(window.location.search); if (next.category !== undefined) { if (next.category === "all") params.delete("category"); else params.set("category", next.category); } if (next.search !== undefined) { if (!next.search.trim()) params.delete("search"); else params.set("search", next.search.trim()); } window.history.replaceState({}, "", `/shop${params.toString() ? `?${params.toString()}` : ""}`); };
  const selectCategory = (category: string) => { setCat(category); updateUrl({ category }); };
  const clearSearch = () => { setSearch(""); updateUrl({ search: "" }); };
  const clearFilters = () => { setCat("all"); setSearch(""); setSort("featured"); window.history.replaceState({}, "", "/shop"); };
  const activeFilterCount = (cat !== "all" ? 1 : 0) + (normalizedSearch ? 1 : 0);
  const categoryName = CATEGORIES.find((item) => item.slug === cat)?.name;

  return <div className="min-h-screen"><SiteNav /><main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-10 lg:px-16">
    <section className="border-b border-border pb-8"><div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Collection 2026 / Catalogue</p><h1 className="mt-3 max-w-4xl text-5xl leading-[0.9] sm:text-6xl lg:text-7xl">{normalizedSearch ? <>Kết quả <span className="text-primary">“{search}”</span></> : <>{cat === "all" ? "Tất cả" : categoryName ?? "Danh mục"} <span className="text-primary">sản phẩm</span></>}</h1><p className="mt-5 max-w-xl text-sm leading-6 text-silver">Modern everyday pieces cho nam và nữ — chọn một item, xem biến thể và chuyển thẳng sang AI TRY-ON khi bạn muốn thử phối đồ.</p></div><div className="w-full lg:max-w-sm"><label className="sr-only" htmlFor="shop-search">Tìm kiếm sản phẩm</label><div className="flex items-center border border-border bg-background focus-within:border-primary"><Search size={16} className="ml-4 shrink-0 text-silver" aria-hidden="true" /><input id="shop-search" value={search} onChange={(event) => { const value = event.target.value; setSearch(value); updateUrl({ search: value }); }} placeholder="Tìm sản phẩm..." className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-silver" />{search && <button type="button" onClick={clearSearch} className="mr-2 grid size-8 place-items-center text-silver hover:text-primary" aria-label="Xóa tìm kiếm"><X size={15} /></button>}</div></div></div></section>
    <section className="mt-6 border-b border-border pb-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><button type="button" onClick={() => setFiltersOpen((open) => !open)} className={`inline-flex items-center gap-2 border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${filtersOpen || activeFilterCount > 0 ? "border-primary text-primary" : "border-border text-beige hover:border-primary"}`} aria-expanded={filtersOpen}><SlidersHorizontal size={14} />Bộ lọc{activeFilterCount > 0 ? ` / ${activeFilterCount}` : ""}</button><span className="text-xs uppercase tracking-[0.12em] text-silver">{list.length} sản phẩm</span></div><div className="flex flex-wrap items-center gap-x-5 gap-y-2"><span className="text-[10px] uppercase tracking-[0.15em] text-silver">Sắp xếp</span>{SORTS.map((item) => <button key={item.id} type="button" onClick={() => setSort(item.id)} className={`text-xs uppercase tracking-[0.12em] transition-colors ${sort === item.id ? "text-primary" : "text-silver hover:text-beige"}`}>{item.label}</button>)}</div></div>{filtersOpen && <div className="mt-5 border-t border-border pt-5"><div className="flex flex-wrap gap-2">{[{ slug: "all", name: "Tất cả" }, ...CATEGORIES].map((category) => <button key={category.slug} type="button" onClick={() => selectCategory(category.slug)} className={`shrink-0 border px-4 py-2 text-xs uppercase tracking-[0.13em] transition-colors ${cat === category.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-beige hover:border-primary"}`}>{category.name}</button>)}</div>{activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="mt-4 text-[10px] uppercase tracking-[0.15em] text-primary hover:underline">Xóa toàn bộ bộ lọc</button>}</div>}</section>
    {list.length > 0 ? <section className="mt-8" aria-label="Danh sách sản phẩm"><div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{list.map((product) => <ProductCard key={product.id} product={product} />)}</div></section> : <section className="mt-8 border-y border-border py-20 text-center"><p className="eyebrow">No match / 0 result</p><h2 className="mt-3 text-3xl leading-tight sm:text-4xl">Không tìm thấy sản phẩm phù hợp.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-silver">Thử từ khóa khác hoặc xóa bộ lọc để xem lại toàn bộ catalogue.</p><button type="button" onClick={clearFilters} className="mt-7 border border-primary px-5 py-3 text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground">Reset catalogue</button></section>}
  </main><SiteFooter /></div>;
}
