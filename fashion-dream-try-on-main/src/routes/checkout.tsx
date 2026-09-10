import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { formatVnd } from "@/data/products";
import { useCart } from "@/lib/cart";
import { createOrder } from "@/lib/order.functions";
import { createVietQrUrl } from "@/lib/vietqr";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Thanh toán | UpThink" },
      {
        name: "description",
        content:
          "Hoàn tất đơn hàng UpThink: giao hàng toàn quốc, thanh toán khi nhận hàng.",
      },
      { property: "og:title", content: "Thanh toán | UpThink" },
      { property: "og:description", content: "Hoàn tất đơn hàng UpThink của bạn." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vietqr">("cod");
  const [paymentInfo, setPaymentInfo] = useState<{
    orderCode: string;
    total: number;
    qrUrl: string;
  } | null>(null);
  
  const shipping = subtotal >= 1000000 ? 0 : 30000;
    //_____________KHỐI VIETQR______________//
  if (paymentInfo) {
    return (
      <div className="min-h-screen">
        <SiteNav />

        <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center">
          <p className="eyebrow">Thanh toán VietQR</p>

          <h1 className="mt-3 text-4xl leading-none">
            Quét mã để thanh toán
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-4 text-beige">
            Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới.
          </p>

          <div className="mx-auto mt-8 max-w-sm border border-border bg-card p-6">
            <img
              src={paymentInfo.qrUrl}
              alt="Mã QR thanh toán VietQR"
              className="mx-auto h-auto w-full"
            />
          </div>

          <div className="mx-auto mt-6 max-w-sm space-y-3 border border-border bg-card p-5 text-left text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-silver">Ngân hàng</span>
              <span>MB Bank</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-silver">Người nhận</span>
              <span>UPTHINK</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-silver">Số tiền</span>
              <span className="text-primary">
                {formatVnd(paymentInfo.total)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-silver">Nội dung</span>
              <span className="text-right">{paymentInfo.orderCode}</span>
            </div>
          </div>

          <p className="mt-6 text-xs text-silver">
            Sau khi chuyển khoản, nhấn nút bên dưới để gửi xác nhận.
            Đơn hàng sẽ được UpThink kiểm tra và xác nhận thanh toán.
          </p>
      
          <button
            type="button"
            onClick={() => {
              clear();
              setDone(paymentInfo.orderCode);
              setPaymentInfo(null);
            }}
            className="mt-6 bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
          >
            Tôi đã chuyển khoản
          </button>

          <div>
            <button
              type="button"
              onClick={() => setPaymentInfo(null)}
              className="mt-4 text-xs text-silver underline underline-offset-4"
            >
              Quay lại
            </button>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }


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
            Mã đơn hàng của bạn là <span className="text-primary">{done}</span>. 
            UpThink sẽ liên hệ xác nhận trong vòng 24 giờ.
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
            Giỏ hàng trống. {" "}
            <Link to="/shop" className="text-primary">
              Chọn sản phẩm
            </Link>
          </p>
        ) : (
          <form
            className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);

              const form = new FormData(e.currentTarget);

              try {
                const result = await createOrder({
                  data: {
                    customerName: String(form.get("name") || ""),
                    phone: String(form.get("phone") || ""),
                    email: String(form.get("email") || ""),
                    address: String(form.get("address") || ""),
                    city: String(form.get("city") || ""),
                    district: String(form.get("district") || ""),
                    paymentMethod,
                    items: items.map((item) => ({
                      productId: item.productId,
                      size: item.size,
                      color: item.color,
                      quantity: item.qty,
                    })),
                  },
                });

        if (paymentMethod === "vietqr") {
          setPaymentInfo({
            orderCode: result.orderCode,
            total: result.total,
            qrUrl: createVietQrUrl(result.total, result.orderCode),
          });
        } else {
          clear();
          setDone(result.orderCode);
        }
              } catch (error) {
                alert(error instanceof Error ? error.message : "Không thể tạo đơn hàng.");
              } finally {
                setSubmitting(false);
              }
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

<p className="pt-4 text-xs uppercase tracking-[0.2em] text-silver">
  Phương thức thanh toán
</p>

<div className="space-y-3">
  <label
    className={`block cursor-pointer border p-4 text-sm transition ${
      paymentMethod === "cod"
        ? "border-primary text-primary"
        : "border-border text-beige"
    }`}
  >
    <input
      type="radio"
      name="paymentMethod"
      value="cod"
      checked={paymentMethod === "cod"}
      onChange={() => setPaymentMethod("cod")}
      className="sr-only"
    />
    <span className="block font-medium">
      Thanh toán khi nhận hàng (COD)
    </span>
    <span className="mt-1 block text-xs text-silver">
      Thanh toán khi nhận hàng
    </span>
  </label>

  <label
    className={`block cursor-pointer border p-4 text-sm transition ${
      paymentMethod === "vietqr"
        ? "border-primary text-primary"
        : "border-border text-beige"
    }`}
  >
    <input
      type="radio"
      name="paymentMethod"
      value="vietqr"
      checked={paymentMethod === "vietqr"}
      onChange={() => setPaymentMethod("vietqr")}
      className="sr-only"
    />
    <span className="block font-medium">
      Thanh toán qua VietQR
    </span>
    <span className="mt-1 block text-xs text-silver">
      Quét mã QR để thanh toán
    </span>
  </label>
</div>
            </div>

            <aside className="h-fit border border-border bg-card p-6">
              <p className="eyebrow">Đơn hàng</p>
              <div className="mt-4 space-y-3 text-sm">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex justify-between gap-3"
                  >
                    <span className="text-beige">
                      {item.product.name} × {item.qty}
                      <span className="block text-xs text-silver">
                        {item.size} · {item.color}
                      </span>
                    </span>
                    <span>{formatVnd(item.product.price * item.qty)}</span>
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
                disabled={submitting}
                className="mt-6 w-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
              >
                {submitting
                  ? "Đang tạo đơn..."
                  : paymentMethod === "vietqr"
                    ? "Tiếp tục thanh toán"
                    : "Đặt hàng COD"}
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
