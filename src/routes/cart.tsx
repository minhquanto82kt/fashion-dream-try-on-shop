import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-4xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border p-10 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Shopping bag
        </p>

        <h1 className="mt-3 text-4xl font-bold">Your cart</h1>

        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Giỏ hàng đã được tạo route. Phần persistence và checkout sẽ được kết
          nối với Supabase ở bước tiếp theo.
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-background"
        >
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
