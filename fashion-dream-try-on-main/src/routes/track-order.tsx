import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { formatVnd } from "@/data/products";
import { supabaseConfig } from "@/lib/upthink-supabase";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Tra cứu đơn hàng | UpThink" },
      { name: "description", content: "Tra cứu trạng thái đơn hàng không cần đăng nhập." },
    ],
  }),
  component: TrackOrderPage,
});

type OrderResult = {
  order_code: string;
  customer_name: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
};

const orderStatusLabels: Record<string, string> = {
  new: "Mới tạo",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

const paymentMethodLabels: Record<string, string> = {
  cod: "COD",
  vietqr: "VietQR",
  momo: "MoMo",
};

function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!orderCode.trim() || !phone.trim()) {
      setError("Vui lòng nhập mã đơn hàng và số điện thoại.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        p_order_code: orderCode.trim(),
        p_phone: phone.trim(),
      });
      const response = await fetch(`${supabaseConfig.url}/rest/v1/rpc/track_guest_order`, {
        method: "POST",
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_order_code: orderCode.trim(),
          p_phone: phone.trim(),
        }),
      });

      const payload = await response.json() as OrderResult[] | { message?: string; hint?: string };
      if (!response.ok) {
        throw new Error("Không thể tra cứu đơn hàng lúc này.");
      }

      const rows = Array.isArray(payload) ? payload : [];
      if (!rows.length) {
        throw new Error("Không tìm thấy đơn hàng phù hợp. Vui lòng kiểm tra lại mã đơn và số điện thoại.");
      }

      setResult(rows[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tra cứu đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28 sm:px-12">
        <p className="eyebrow">Guest order tracking</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">Tra cứu đơn hàng<span className="text-primary">.</span></h1>
        <p className="mt-4 max-w-2xl leading-7 text-beige">Không cần đăng nhập. Nhập mã đơn hàng và số điện thoại đã dùng khi đặt hàng.</p>

        <form onSubmit={handleSubmit} className="mt-10 border border-border bg-card p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="text-xs uppercase tracking-[0.2em] text-silver">Mã đơn hàng</span>
              <input value={orderCode} onChange={(event) => setOrderCode(event.target.value)} placeholder="FD-20260912-ABCDE" autoComplete="off" className="mt-2 min-h-11 w-full border border-border bg-background px-4 py-3 text-sm uppercase outline-none focus:border-primary" />
            </label>
            <label className="block min-w-0">
              <span className="text-xs uppercase tracking-[0.2em] text-silver">Số điện thoại</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="09xxxxxxxx" inputMode="tel" autoComplete="tel" className="mt-2 min-h-11 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </label>
          </div>
          {error ? <p role="alert" className="mt-5 border border-destructive/40 bg-destructive/5 p-3 text-sm leading-6 text-destructive">{error}</p> : null}
          <button type="submit" disabled={loading} className="mt-6 min-h-11 w-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50 sm:w-auto">{loading ? "Đang tra cứu..." : "Tra cứu đơn hàng"}</button>
        </form>

        {result ? (
          <section className="mt-8 border border-border bg-card p-5 sm:p-7" aria-live="polite">
            <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Đơn hàng</p>
                <h2 className="mt-2 break-all text-2xl text-primary">{result.order_code}</h2>
                <p className="mt-2 text-xs text-silver">{new Date(result.created_at).toLocaleString("vi-VN")}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="border border-primary/50 px-3 py-2 text-primary">{orderStatusLabels[result.order_status] || result.order_status}</span>
                <span className="border border-border px-3 py-2 text-beige">{paymentStatusLabels[result.payment_status] || result.payment_status}</span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <Info label="Khách hàng" value={result.customer_name} />
              <Info label="Thanh toán" value={paymentMethodLabels[result.payment_method] || result.payment_method} />
              <Info label="Tạm tính" value={formatVnd(result.subtotal)} />
              <Info label="Vận chuyển" value={result.shipping_fee === 0 ? "Miễn phí" : formatVnd(result.shipping_fee)} />
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5 font-display text-lg">
              <span>Tổng đơn</span><span className="text-primary">{formatVnd(result.total)}</span>
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-5 text-sm">
          <Link to="/shop" className="text-primary underline underline-offset-4">Tiếp tục mua sắm</Link>
          <Link to="/account" className="text-silver underline underline-offset-4">Đăng nhập tài khoản</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="border border-border p-4"><p className="text-xs uppercase tracking-[0.16em] text-silver">{label}</p><p className="mt-2 break-words leading-6">{value}</p></div>;
}
