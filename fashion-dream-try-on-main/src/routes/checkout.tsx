import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { formatVnd } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Thanh toán | UpThink" },
      { name: "description", content: "Hoàn tất đơn hàng UpThink: giao hàng toàn quốc, thanh toán khi nhận hàng hoặc chuyển khoản." },
      { property: "og:title", content: "Thanh toán | UpThink" },
      { property: "og:description", content: "Hoàn tất đơn hàng UpThink của bạn." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [done, setDone] = useState<string | null>(null);
  const [payment, setPayment] = useState("cod");
  const shipping = subtotal >= 1000000 ? 0 : 30000;

  if (done) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center">
          <p className="eyebrow">Đặt hàng thành công</p>
          <h1 className="mt-3 text-4xl leading-none">
            Cảm ơn bạn <span className="text-primary">!</span>
          </h1>
          <p className="mt-4 text-beige">
            Mã đơn hàng của bạn là <span className="text-primary">{done}</span>. UpThink sẽ liên hệ
            xác nhận trong vòng 24 giờ.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
          >
            Tiếp tục mua sắm
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28 sm:px-12">
        <h1 className="text-4xl leading-none">Thanh toán</h1>

        {items.length === 0 ? (
          <p className="mt-8 text-beige">
            Giỏ hàng trống.{" "}
            <Link to="/shop" className="text-primary">
              Chọn sản phẩm
            </Link>
          </p>
        ) : (
          <form
            className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]"
            onSubmit={(e) => {
              e.preventDefault();
              const code = `UT${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
              clear();
              setDone(code);
            }}
          >
            <div className="space-y-4">
              <Field label="Họ và tên" name="name" />
              <Field label="Số điện thoại" name="phone" type="tel" />
              <Field label="Email" name="email" type="email" />
              <Field label="Địa chỉ giao hàng" name="address" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tỉnh / Thành phố" name="city" />
                <Field label="Quận / Huyện" name="district" />
              </div>

              <p className="pt-4 text-xs uppercase tracking-[0.2em] text-silver">Phương thức thanh toán</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "cod", label: "Thanh toán khi nhận hàng" },
                  { id: "bank", label: "Chuyển khoản ngân hàng" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPayment(p.id)}
                    className={`border p-4 text-left text-sm ${
                      payment === p.id ? "border-primary text-primary" : "border-border text-beige"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <aside className="h-fit border border-border bg-card p-6">
              <p className="eyebrow">Đơn hàng</p>
              <div className="mt-4 space-y-3 text-sm">
                {items.map((i) => (
                  <div key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between gap-3">
                    <span className="text-beige">
                      {i.product.name} × {i.qty}
                      <span className="block text-xs text-silver">
                        {i.size} · {i.color}
                      </span>
                    </span>
                    <span>{formatVnd(i.product.price * i.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm">
                <span className="text-silver">Vận chuyển</span>
                <span>{shipping === 0 ? "Miễn phí" : formatVnd(shipping)}</span>
              </div>
              <div className="mt-3 flex justify-between font-display text-lg">
                <span>Tổng</span>
                <span className="text-primary">{formatVnd(subtotal + shipping)}</span>
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
              >
                Đặt hàng
              </button>
            </aside>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-silver">{label}</span>
      <input
        required
        name={name}
        type={type}
        className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
