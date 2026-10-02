import { createClientOnlyFn } from "@tanstack/react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { formatVnd } from "@/data/products";
import { useCart } from "@/lib/cart";
import { createOrder } from "@/lib/order.functions";
import { getCustomerSession } from "@/lib/auth";
import { isMockUserMode } from "@/lib/mock-user";
import { getInvoiceData, type InvoiceData } from "@/lib/invoice.functions";
import { createVietQrUrl } from "@/lib/vietqr";
import "@/styles/wearo-checkout-page.css";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Thanh toán | WEARO" }] }),
  component: CheckoutPage,
});

type PaymentMethod = "cod" | "vietqr" | "momo" | "mastercard";

type PaymentInfo = {
  orderCode: string;
  total: number;
  qrUrl: string;
  phone: string;
};

type PendingInvoice = {
  orderCode: string;
  phone: string;
  createdAt: number;
};

const CHECKOUT_KEY = "wearo_checkout_idempotency_key";
const PENDING_INVOICE_KEY = "wearo_pending_invoice";

const openInvoicePdfClient = createClientOnlyFn(async (invoice: InvoiceData) => {
  const module = await import("@/lib/invoice.client");
  module.openInvoicePdf(invoice);
});

function createIdempotencyKey() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {}
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createMockOrderCode() {
  return `DEMO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function CheckoutPage() {
  const { items, subtotal, clear, hasStockIssues } = useCart();
  const [mockMode, setMockMode] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const sync = () => setMockMode(isMockUserMode());
    sync();
    window.addEventListener("wearo:mock-user:changed", sync);
    return () => window.removeEventListener("wearo:mock-user:changed", sync);
  }, []);

  const shipping = subtotal === 0 || subtotal >= 1000000 ? 0 : 30000;

  const finish = async (data: InvoiceData) => {
    setInvoice(data);
    setDone(data.order_code);
    setCountdown(5);
    clear();
    sessionStorage.removeItem(CHECKOUT_KEY);
    sessionStorage.removeItem(PENDING_INVOICE_KEY);
    checkoutKeyRef.current = null;
  };

  const verifyOnlinePayment = async (orderCode: string, phone: string) => {
    setWaitingPayment(true);
    setErrorMessage(null);
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const data = await getInvoiceData({ data: { orderCode, phone } });
        await finish(data);
        setPaymentInfo(null);
        setWaitingPayment(false);
        return;
      } catch (error) {
        if (!(error instanceof Error) || error.message !== "INVOICE_NOT_READY") {
          setWaitingPayment(false);
          setErrorMessage(error instanceof Error ? error.message : "Không thể xác minh thanh toán.");
          return;
        }
      }
      await new Promise((resolve) => window.setTimeout(resolve, 3000));
    }
    setWaitingPayment(false);
    setErrorMessage("Chưa nhận được xác nhận thanh toán. Bạn có thể kiểm tra lại sau ít phút.");
  };

  useEffect(() => {
    if (mockMode) return;
    const raw = sessionStorage.getItem(PENDING_INVOICE_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as PendingInvoice;
      if (!pending.orderCode || !pending.phone || Date.now() - pending.createdAt > 10 * 60 * 1000) {
        sessionStorage.removeItem(PENDING_INVOICE_KEY);
        return;
      }
      void verifyOnlinePayment(pending.orderCode, pending.phone);
    } catch {
      sessionStorage.removeItem(PENDING_INVOICE_KEY);
    }
  }, [mockMode]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (invoice) void openInvoicePdfClient(invoice);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value === null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, invoice]);

  if (paymentInfo) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center sm:px-12">
          <p className="eyebrow">Thanh toán VietQR</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">Quét mã để thanh toán<span className="text-primary">.</span></h1>
          <p className="mt-4 leading-7 text-beige">Hóa đơn PDF chỉ được phát hành sau khi hệ thống xác minh giao dịch thành công.</p>
          <div className="mx-auto mt-8 max-w-sm border border-border bg-card p-4 sm:p-6">
            <img src={paymentInfo.qrUrl} alt="Mã QR thanh toán VietQR" className="mx-auto h-auto w-full" />
          </div>
          <div className="mx-auto mt-6 max-w-sm space-y-3 border border-border bg-card p-4 text-left text-sm sm:p-5">
            <SummaryRow label="Ngân hàng" value="MB Bank" />
            <SummaryRow label="Người nhận" value="WEARO" />
            <SummaryRow label="Số tiền" value={formatVnd(paymentInfo.total)} highlight />
            <SummaryRow label="Nội dung" value={paymentInfo.orderCode} />
          </div>
          {errorMessage && <p className="mt-5 border border-red-500/30 bg-red-500/5 p-3 text-sm text-beige">{errorMessage}</p>}
          <p className="mt-6 text-xs leading-6 text-silver">{waitingPayment ? "Đang xác minh giao dịch…" : "Sau khi chuyển khoản, bấm nút để hệ thống kiểm tra."}</p>
          <button type="button" disabled={waitingPayment} onClick={() => void verifyOnlinePayment(paymentInfo.orderCode, paymentInfo.phone)} className="mt-6 min-h-11 w-full bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50 sm:w-auto">
            {waitingPayment ? "Đang xác minh…" : "Tôi đã chuyển khoản"}
          </button>
          {!waitingPayment && <button type="button" onClick={() => setPaymentInfo(null)} className="mt-4 min-h-10 px-2 text-xs text-silver underline underline-offset-4">Quay lại</button>}
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
          <p className="eyebrow">{mockMode ? "Mock User · Xem trước đơn hàng" : "Đơn hàng đã được xác nhận"}</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{mockMode ? "Xem trước thành công" : "Cảm ơn bạn"}<span className="text-primary">!</span></h1>
          <p className="mt-4 leading-7 text-beige">Mã {mockMode ? "đơn xem trước" : "đơn hàng"}: <span className="break-words text-primary">{done}</span>.</p>
          {mockMode && <p className="mt-4 text-sm leading-6 text-silver">Mock order — không được ghi vào hệ thống đơn hàng production.</p>}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/shop" className="inline-flex min-h-11 items-center justify-center border border-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary">Tiếp tục mua sắm</Link>
            <Link to="/account" className="inline-flex min-h-11 items-center justify-center border border-border px-7 py-3 text-xs uppercase tracking-[0.15em]">Tài khoản</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28 sm:px-12">
        <p className="eyebrow">{mockMode ? "SANDBOX CHECKOUT" : "WEARO CHECKOUT"}</p>
        <h1 className="text-4xl leading-tight sm:text-5xl">Thanh toán</h1>
        {!mockMode && <div className="mt-5 border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-beige">Bạn có thể thanh toán ngay không cần đăng ký tài khoản. Đăng ký tài khoản để lưu lịch sử mua hàng và nhận thêm quyền lợi cá nhân hóa.</div>}
        {mockMode && <div className="mt-5 border border-primary/30 bg-primary/5 px-4 py-3 text-sm leading-6 text-beige">Chế độ Mock User: mô phỏng trải nghiệm khách hàng trong Sandbox; không ghi đơn hàng hoặc giao dịch vào production.</div>}

        {items.length === 0 ? (
          <p className="mt-8 leading-7 text-beige">Giỏ hàng trống. <Link to="/shop" className="text-primary">Chọn sản phẩm</Link></p>
        ) : (
          <form
            className="mt-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:gap-10"
            onSubmit={async (event) => {
              event.preventDefault();
              if (submitting || hasStockIssues) return;
              setSubmitting(true);
              setErrorMessage(null);
              const form = new FormData(event.currentTarget);
              const phone = String(form.get("phone") || "").trim();
              try {
                const session = mockMode ? null : getCustomerSession();
                const orderItems = items.map((item) => {
                  if (!item.variantId) throw new Error(`Không xác định được biến thể của "${item.product.name}". Vui lòng xóa sản phẩm này khỏi giỏ và thêm lại.`);
                  return { productId: item.productId, variantId: item.variantId, size: item.size, color: item.color, quantity: item.qty };
                });

                if (mockMode) {
                  clear();
                  sessionStorage.removeItem(CHECKOUT_KEY);
                  checkoutKeyRef.current = null;
                  setDone(createMockOrderCode());
                  return;
                }

                const idempotencyKey = checkoutKeyRef.current || sessionStorage.getItem(CHECKOUT_KEY) || createIdempotencyKey();
                checkoutKeyRef.current = idempotencyKey;
                sessionStorage.setItem(CHECKOUT_KEY, idempotencyKey);

                const result = await createOrder({ data: {
                  customerName: String(form.get("name") || "").trim(),
                  phone,
                  email: String(form.get("email") || "").trim() || undefined,
                  address: String(form.get("address") || "").trim(),
                  city: String(form.get("city") || "").trim(),
                  district: String(form.get("district") || "").trim(),
                  paymentMethod,
                  items: orderItems,
                  accessToken: session?.access_token,
                  idempotencyKey,
                }});

                if (paymentMethod === "vietqr") {
                  clear();
                  setPaymentInfo({ orderCode: result.orderCode, total: result.total, qrUrl: createVietQrUrl(result.total, result.orderCode), phone });
                  return;
                }

                if (paymentMethod === "momo" || paymentMethod === "mastercard") {
                  sessionStorage.setItem(PENDING_INVOICE_KEY, JSON.stringify({ orderCode: result.orderCode, phone, createdAt: Date.now() } satisfies PendingInvoice));
                  const endpoint = paymentMethod === "momo" ? "/api/momo/create" : "/api/mastercard/create";
                  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderCode: result.orderCode }) });
                  const payload = await response.json() as { success?: boolean; error?: string; payment?: { payUrl?: string; redirectUrl?: string } };
                  const redirectUrl = paymentMethod === "momo" ? payload.payment?.payUrl : payload.payment?.redirectUrl;
                  if (!response.ok || !payload.success || !redirectUrl) throw new Error(payload.error || "Không thể khởi tạo thanh toán.");
                  clear();
                  window.location.assign(redirectUrl);
                  return;
                }

                const data = await getInvoiceData({ data: { orderCode: result.orderCode, phone } });
                await finish(data);
              } catch (error) {
                sessionStorage.removeItem(PENDING_INVOICE_KEY);
                setErrorMessage(error instanceof Error ? error.message : "Không thể tạo đơn hàng.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="min-w-0 space-y-4">
              <Field label="Họ và tên" name="name" />
              <Field label="Số điện thoại" name="phone" type="tel" />
              <Field label="Email (không bắt buộc)" name="email" type="email" />
              <Field label="Địa chỉ giao hàng" name="address" />
              <div className="grid min-w-0 gap-4 sm:grid-cols-2"><Field label="Tỉnh / Thành phố" name="city" /><Field label="Quận / Huyện" name="district" /></div>
              <p className="pt-4 text-xs uppercase leading-5 tracking-[0.2em] text-silver">Phương thức thanh toán</p>
              <div className="space-y-3">
                <PaymentOption method="cod" current={paymentMethod} onChange={setPaymentMethod} title="Thanh toán khi nhận hàng (COD)" description="Xem hóa đơn sau khi đơn được tạo" />
                <PaymentOption method="vietqr" current={paymentMethod} onChange={setPaymentMethod} title="Thanh toán qua VietQR" description="Hóa đơn chỉ xuất hiện sau khi giao dịch được xác minh" />
                <PaymentOption method="momo" current={paymentMethod} onChange={setPaymentMethod} title="Thanh toán qua MoMo" description="Hóa đơn chỉ xuất hiện sau khi MoMo xác nhận thanh toán" />
                <PaymentOption method="mastercard" current={paymentMethod} onChange={setPaymentMethod} title="Visa / Mastercard" description="Thanh toán thẻ qua Mastercard Gateway" />
              </div>
              {errorMessage && <div className="border border-red-500/30 bg-red-500/5 p-4 text-sm leading-6 text-beige">{errorMessage}</div>}
            </div>

            <aside className="h-fit min-w-0 border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="eyebrow">Đơn hàng</p>
              <div className="mt-4 space-y-3 text-sm">
                {items.map((item) => <div key={item.variantId ?? `${item.productId}-${item.size}-${item.color}`} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3"><span className="min-w-0 break-words text-beige leading-6">{item.product.name} × {item.qty}<span className="block text-xs leading-5 text-silver">{item.size} · {item.color}</span></span><span className="whitespace-nowrap text-right">{formatVnd(item.product.price * item.qty)}</span></div>)}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4 text-sm"><span className="text-silver">Vận chuyển</span><span>{shipping === 0 ? "Miễn phí" : formatVnd(shipping)}</span></div>
              <div className="mt-3 flex items-start justify-between gap-4 font-display text-lg leading-tight"><span>Tổng</span><span className="text-primary">{formatVnd(subtotal + shipping)}</span></div>
              <button type="submit" disabled={submitting || hasStockIssues} className="mt-6 flex min-h-11 w-full items-center justify-center bg-primary px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50">{submitting ? "Đang tạo đơn..." : hasStockIssues ? "Kiểm tra tồn kho" : mockMode ? "Xem trước đơn hàng" : paymentMethod === "vietqr" ? "Tiếp tục thanh toán" : paymentMethod === "momo" ? "Thanh toán với MoMo" : paymentMethod === "mastercard" ? "Thanh toán bằng Visa / Mastercard" : "Đặt hàng COD"}</button>
            </aside>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return <label className="block text-sm"><span className="mb-2 block text-silver">{label}</span><input required={name !== "email"} name={name} type={type} className="min-h-11 w-full border border-border bg-transparent px-4 py-3 outline-none focus:border-primary" /></label>;
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4"><span className="text-silver">{label}</span><span className={`text-right ${highlight ? "text-primary" : ""}`}>{value}</span></div>;
}

function PaymentOption({ method, current, onChange, title, description }: { method: PaymentMethod; current: PaymentMethod; onChange: (method: PaymentMethod) => void; title: string; description: string }) {
  const selected = current === method;
  return <label className={`block cursor-pointer border transition ${selected ? "border-primary bg-primary/5" : "border-border"}`}><input type="radio" name="paymentMethod" value={method} checked={selected} onChange={() => onChange(method)} className="sr-only" /><span className="flex min-h-[76px] items-center gap-4 p-4"><span className={`flex h-12 w-12 shrink-0 items-center justify-center border text-[10px] font-medium uppercase tracking-[0.08em] ${selected ? "border-primary text-primary" : "border-border text-silver"}`}>{method === "mastercard" ? "CARD" : method === "momo" ? "MOMO" : method === "cod" ? "COD" : "QR"}</span><span className="min-w-0 flex-1"><span className={`block font-medium leading-6 ${selected ? "text-primary" : "text-beige"}`}>{title}</span><span className="mt-1 block text-xs leading-5 text-silver">{description}</span></span><span className={`h-4 w-4 shrink-0 rounded-full border ${selected ? "border-primary bg-primary" : "border-silver"}`} /></span></label>;
}
