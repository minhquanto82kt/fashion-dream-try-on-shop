import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getInvoiceData, type InvoiceData } from "@/lib/invoice.functions";
import { createClientOnlyFn } from "@tanstack/react-start";

export const Route = createFileRoute("/checkout/mastercard")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : undefined,
  }),
  head: () => ({ meta: [{ title: "Xác nhận thanh toán | WEARO" }] }),
  component: MastercardReturnPage,
});

const openInvoicePdfClient = createClientOnlyFn(async (invoice: InvoiceData) => {
  const module = await import("@/lib/invoice.client");
  module.openInvoicePdf(invoice);
});

function MastercardReturnPage() {
  const search = Route.useSearch();
  const orderCode = search.order?.trim() ?? "";
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "failed">("checking");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderCode) {
      setStatus("failed");
      setError("Thiếu mã đơn hàng.");
      return;
    }

    let cancelled = false;
    const verify = async () => {
      for (let attempt = 0; attempt < 20 && !cancelled; attempt += 1) {
        try {
          const response = await fetch(`/api/mastercard/status?orderCode=${encodeURIComponent(orderCode)}`, { cache: "no-store" });
          const payload = await response.json() as { success?: boolean; status?: string; error?: string };
          if (payload.success && payload.status === "paid") {
            const phone = sessionStorage.getItem("wearo_mastercard_phone") || "";
            if (phone) {
              try {
                const data = await getInvoiceData({ data: { orderCode, phone } });
                if (!cancelled) {
                  setInvoice(data);
                  setStatus("paid");
                  sessionStorage.removeItem("wearo_pending_invoice");
                  sessionStorage.removeItem("wearo_mastercard_phone");
                  sessionStorage.removeItem("wearo_checkout_idempotency_key");
                  window.setTimeout(() => void openInvoicePdfClient(data), 800);
                }
                return;
              } catch {
                // Payment is verified; invoice lookup may require another short retry.
              }
            } else if (!cancelled) {
              setStatus("paid");
              return;
            }
          }
          if (!response.ok && payload.error) throw new Error(payload.error);
          if (!cancelled) setStatus("pending");
        } catch (err) {
          if (!cancelled && attempt === 19) {
            setStatus("failed");
            setError(err instanceof Error ? err.message : "Không thể xác minh thanh toán.");
            return;
          }
        }
        await new Promise((resolve) => window.setTimeout(resolve, 3000));
      }
      if (!cancelled) setStatus("pending");
    };

    void verify();
    return () => { cancelled = true; };
  }, [orderCode]);

  return <div className="min-h-screen"><SiteNav /><main className="mx-auto max-w-2xl px-6 pb-24 pt-32 text-center sm:px-12"><p className="eyebrow">Visa / Mastercard</p><h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{status === "paid" ? "Thanh toán thành công" : status === "failed" ? "Không thể xác nhận" : "Đang xác nhận thanh toán"}<span className="text-primary">.</span></h1><p className="mt-5 leading-7 text-beige">{status === "paid" ? `Đơn hàng ${orderCode} đã được hệ thống xác nhận thanh toán.` : status === "failed" ? error : `Đang kiểm tra giao dịch ${orderCode}. Không đóng trang trong lúc hệ thống xác minh.`}</p>{invoice && <div className="mt-8 border border-border bg-card p-5 text-left"><div className="flex justify-between gap-4 text-sm"><span className="text-silver">Tổng thanh toán</span><span className="text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(invoice.total)}</span></div></div>}<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link to="/shop" className="inline-flex min-h-11 items-center justify-center border border-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary">Tiếp tục mua sắm</Link><Link to="/account" className="inline-flex min-h-11 items-center justify-center border border-border px-7 py-3 text-xs uppercase tracking-[0.15em]">Tài khoản</Link></div></main><SiteFooter /></div>;
}
