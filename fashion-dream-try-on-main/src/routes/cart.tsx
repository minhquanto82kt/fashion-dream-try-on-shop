import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { formatVnd } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Giỏ hàng | UpThink" },
      { name: "description", content: "Xem lại các món đồ UpThink bạn đã chọn trước khi thanh toán." },
      { property: "og:title", content: "Giỏ hàng | UpThink" },
      { property: "og:description", content: "Xem lại đơn hàng UpThink của bạn." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const shipping = subtotal === 0 || subtotal >= 1000000 ? 0 : 30000;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28 sm:px-12">
        <h1 className="text-4xl leading-none">Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="mt-10 border border-border bg-card p-10 text-center">
            <p className="text-beige">Giỏ hàng đang trống.</p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="divide-y divide-border border border-border">
              {items.map((item, i) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 p-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="size-24 object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-silver">
                      {item.size} · {item.color}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => setQty(i, item.qty - 1)} className="border border-border p-1">
                        <Minus className="size-3" />
                      </button>
                      <span className="text-sm">{item.qty}</span>
                      <button onClick={() => setQty(i, item.qty + 1)} className="border border-border p-1">
                        <Plus className="size-3" />
                      </button>
                      <button onClick={() => remove(i)} className="ml-2 text-silver hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="font-display text-primary">{formatVnd(item.product.price * item.qty)}</p>
                </div>
              ))}
            </div>

            <aside className="h-fit border border-border bg-card p-6">
              <p className="eyebrow">Tổng kết</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-silver">Tạm tính</span>
                  <span>{formatVnd(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Vận chuyển</span>
                  <span>{shipping === 0 ? "Miễn phí" : formatVnd(shipping)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg">
                <span>Tổng</span>
                <span className="text-primary">{formatVnd(subtotal + shipping)}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-6 block bg-primary px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-primary-foreground"
              >
                Thanh toán
              </Link>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
