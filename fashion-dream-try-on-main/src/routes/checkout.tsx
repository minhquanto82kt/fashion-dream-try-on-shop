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
      {
        property: "og:description",
        content: "Hoàn tất đơn hàng UpThink của bạn.",
      },
    ],
  }),
  component: CheckoutPage,
});

type PaymentInfo = {
  orderCode: string;
  total: number;
  qrUrl: string;
};

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();

  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "vietqr">("cod");
  const [paymentInfo, setPaymentInfo] =
    useState<PaymentInfo | null>(null);

  const shipping =
    subtotal === 0 || subtotal >= 1_000_000 ? 0 : 30_000;

  if (paymentInfo) {
    return (
      <div className="min-h-screen">
        <SiteNav />

        <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center sm:px-12">
          <p className="eyebrow">Thanh toán VietQR</p>

          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
            Quét mã để thanh toán
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-4 leading-7 text-beige">
            Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới.
          </p>

          <div className="mx-auto mt-8 max-w-sm border border-border bg-card p-4 sm:p-6">
            <img
              src={paymentInfo.qrUrl}
              alt="Mã QR thanh toán VietQR"
              className="mx-auto h-auto w-full"
            />
          </div>

          <div className="mx-auto mt-6 max-w-sm space-y-3 border border-border bg-card p-4 text-left text-sm sm:p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <span className="text-silver">Ngân hàng</span>
              <span className="text-right">MB Bank</span>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <span className="text-silver">Người nhận</span>
              <span className="text-right">UPTHINK</span>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <span className="text-silver">Số tiền</span>
              <span className="text-right text-primary">
                {formatVnd(paymentInfo.total)}
              </span>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <span className="text-silver">Nội dung</span>
              <span className="break-words text-right">
                {paymentInfo.orderCode}
              </span>
            </div>
          </div>

          <p className="mt-6 text-xs leading-6 text-silver">
            Sau khi chuyển khoản, nhấn nút bên dưới để hoàn tất bước xác nhận từ phía khách hàng. Trạng thái thanh toán vẫn là <strong>Chờ thanh toán</strong> cho đến khi hệ thống xác minh giao dịch thành công.
          </p>

          <button
            type="button"
            onClick={() => {
              setDone(paymentInfo.orderCode);
              setPaymentInfo(null);
            }}
            className="mt-6 min-h-11 w-full bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground sm:w-auto"
          >
            Tôi đã chuyển khoản
          </button>

          <div>
            <button
              type="button"
              onClick={() => setPaymentInfo(null)}
              className="mt-4 min-h-10 px-2 text-xs text-silver underline underline-offset-4"
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

        <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center sm:px-12">
          <p className="eyebrow">Đơn hàng đã được tạo</p>

          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
            Cảm ơn bạn
            <span className="text-primary">!</span>
          </h1>

          <p className="mt-4 leading-7 text-beige">
            Mã đơn hàng của bạn là{" "}
            <span className="break-words text-primary">{done}</span>.
          </p>

          <div className="mt-6 border border-border bg-card p-4 text-left text-sm leading-6 sm:p-5">
            <p>
              Đơn hàng đã được ghi nhận vào hệ thống. Nếu bạn thanh toán VietQR, trạng thái thanh toán sẽ chỉ chuyển sang
              <strong> Đã thanh toán</strong> sau khi giao dịch được xác minh.
            </p>
          </div>

          <Link
            to="/shop"
            className="mt-8 inline-flex min-h-11 items-center justify-center bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
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
        <h1 className="text-4xl leading-tight sm:text-5xl">Thanh toán</h1>

        {items.length === 0 ? (
          <p className="mt-8 leading-7 text-beige">
            Giỏ hàng trống.{" "}
            <Link to="/shop" className="text-primary">
              Chọn sản phẩm
            </Link>
          </p>
        ) : (
          <form
            className="mt-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:gap-10"
            onSubmit={async (event) => {
              event.preventDefault();

              if (submitting) return;

              setSubmitting(true);

              const form = new FormData(event.currentTarget);

              try {
                const result = await createOrder({
                  data: {
                    customerName: String(
                      form.get("name") || "",
                    ),
                    phone: String(form.get("phone") || ""),
                    email: String(form.get("email") || ""),
                    address: String(
                      form.get("address") || "",
                    ),
                    city: String(form.get("city") || ""),
                    district: String(
                      form.get("district") || "",
                    ),
                    paymentMethod,
                    items: items.map((item) => ({
                      productId: item.productId,
                      size: item.size,
                      color: item.color,
                      quantity: item.qty,
                    })),
                  },
                });

                clear();

                if (paymentMethod === "vietqr") {
                  setPaymentInfo({
                    orderCode: result.orderCode,
                    total: result.total,
                    qrUrl: createVietQrUrl(
                      result.total,
                      result.orderCode,
                    ),
                  });
                } else {
                  setDone(result.orderCode);
                }
              } catch (error) {
                alert(
                  error instanceof Error
                    ? error.message
                    : "Không thể tạo đơn hàng.",
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="min-w-0 space-y-4">
              <Field label="Họ và tên" name="name" />
              <Field
                label="Số điện thoại"
                name="phone"
                type="tel"
              />
              <Field
                label="Email"
                name="email"
                type="email"
              />
              <Field
                label="Địa chỉ giao hàng"
                name="address"
              />

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Field
                  label="Tỉnh / Thành phố"
                  name="city"
                />
                <Field
                  label="Quận / Huyện"
                  name="district"
                />
              </div>

              <p className="pt-4 text-xs uppercase leading-5 tracking-[0.2em] text-silver">
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
                    onChange={() =>
                      setPaymentMethod("cod")
                    }
                    className="sr-only"
                  />

                  <span className="block font-medium leading-6">
                    Thanh toán khi nhận hàng (COD)
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-silver">
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
                    onChange={() =>
                      setPaymentMethod("vietqr")
                    }
                    className="sr-only"
                  />

                  <span className="block font-medium leading-6">
                    Thanh toán qua VietQR
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-silver">
                    Quét mã QR để thanh toán
                  </span>
                </label>
              </div>
            </div>

            <aside className="h-fit min-w-0 border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="eyebrow">Đơn hàng</p>

              <div className="mt-4 space-y-3 text-sm">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3"
                  >
                    <span className="min-w-0 break-words text-beige leading-6">
                      {item.product.name} × {item.qty}

                      <span className="block text-xs leading-5 text-silver">
                        {item.size} · {item.color}
                      </span>
                    </span>

                    <span className="whitespace-nowrap text-right">
                      {formatVnd(
                        item.product.price * item.qty,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4 text-sm">
                <span className="text-silver">Vận chuyển</span>

                <span className="text-right">
                  {shipping === 0
                    ? "Miễn phí"
                    : formatVnd(shipping)}
                </span>
              </div>

              <div className="mt-3 flex items-start justify-between gap-4 font-display text-lg leading-tight">
                <span>Tổng</span>

                <span className="text-right text-primary">
                  {formatVnd(subtotal + shipping)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex min-h-11 w-full items-center justify-center bg-primary px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
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

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs uppercase leading-5 tracking-[0.2em] text-silver">
        {label}
      </span>

      <input
        required
        name={name}
        type={type}
        className="mt-2 min-h-11 w-full min-w-0 border border-border bg-card px-4 py-3 text-sm leading-6 outline-none focus:border-primary"
      />
    </label>
  );
}
