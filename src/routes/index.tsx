import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/products";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const featuredProducts = PRODUCTS.slice(0, 6);

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-bold tracking-[0.2em]">
            UPTHINK.
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/shop">Collections</Link>
            <Link to="/ai">AI Studio</Link>
            <Link to="/about">About</Link>
            <Link to="/cart">Cart</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-5 flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
            <Sparkles size={16} />
            AI Fashion / 2026
          </p>

          <h1 className="max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
            Fashion,
            <br />
            imagined on you.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Khám phá thời trang và trải nghiệm virtual try-on bằng AI trước
            khi quyết định mua.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-background"
            >
              Shop collection
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/ai"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3"
            >
              <Sparkles size={16} />
              AI Try-On
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PRODUCTS.slice(0, 4).map((product) => (
            <img
              key={product.id}
              src={product.image}
              alt={product.name}
              className="aspect-[3/4] w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Featured
            </p>
            <h2 className="mt-2 text-3xl font-bold">Latest collection</h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm underline"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
