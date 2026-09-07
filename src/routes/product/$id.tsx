import {
  Link,
  createFileRoute,
  notFound,
} from "@tanstack/react-router";

import { getProduct, formatVnd } from "@/data/products";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);

    if (!product) {
      throw notFound();
    }

    return product;
  },

  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
      <Link
        to="/shop"
        className="text-sm text-muted-foreground underline"
      >
        ← Back to shop
      </Link>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[3/4] w-full rounded-3xl object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-5 text-2xl font-semibold">
            {formatVnd(product.price)}
          </p>

          <p className="mt-6 leading-7 text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="text-sm font-semibold">Sizes</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-full border px-4 py-2 text-sm"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold">Colors</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <span
                  key={color}
                  className="rounded-full border px-4 py-2 text-sm"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>

          <Link
            to="/ai"
            className="mt-10 inline-flex w-fit rounded-full bg-foreground px-7 py-3 text-background"
          >
            Try this item with AI
          </Link>
        </div>
      </div>
    </main>
  );
}
