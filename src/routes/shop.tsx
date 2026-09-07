import { createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/products";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

function ShopPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Collection
        </p>

        <h1 className="mt-2 text-5xl font-bold">Shop</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Khám phá toàn bộ collection thời trang của UPTHINK.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
