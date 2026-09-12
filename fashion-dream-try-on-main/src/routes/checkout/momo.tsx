import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/momo")({
  head: () => ({
    meta: [
      { title: "MoMo | UpThink" },
      { name: "description", content: "Kết quả chuyển hướng thanh toán MoMo." },
    ],
  }),
  component: MomoReturnPage,
});

function MomoReturnPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const orderCode = params.get("orderId") || params.get("orderCode");
  const resultCode = params.get("resultCode");

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
        <p className="eyebrow">MoMo RETURN</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
          Đang xác minh thanh toán<span className="text-primary">.</span>
        </h1>
        <p className="mt-5 leading-7 text-beige">
          Website đã nhận chuyển hướng từ MoMo. Trạng thái <strong>Đã thanh toán</strong> chỉ được cập nhật sau khi hệ thống nhận và xác thực IPN từ MoMo.
        </p>
        {orderCode ? <div className="mt-6 border border-border bg-card px-6 py-5 text-sm"><span className="text-silver">Mã đơn hàng</span><div className="mt-2 break-all text-primary">{orderCode}</div>{resultCode ? <div className="mt-2 text-xs text-silver">MoMo resultCode: {resultCode}</div> : null}</div> : null}
        <p className="mt-6 text-xs leading-6 text-silver">Bạn có thể kiểm tra lại đơn hàng sau ít phút. Không cần thanh toán lại nếu giao dịch đang được xác minh.</p>
        <Link to="/shop" className="mt-8 inline-flex min-h-11 items-center justify-center bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground">Tiếp tục mua sắm</Link>
      </main>
    </div>
  );
}
