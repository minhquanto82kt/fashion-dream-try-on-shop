import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getCustomerSession } from "@/lib/auth";
import { getMyOrder, type CustomerOrderDetail } from "@/lib/order.functions";
import { formatVnd } from "@/data/products";

export const Route = createFileRoute("/account/orders/$id")({ component: CustomerOrderDetailPage });

function CustomerOrderDetailPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const run = async () => {
      const session = getCustomerSession();
      if (!session?.access_token) { if (active) { setError("Vui lòng đăng nhập để xem đơn hàng."); setLoading(false); } return; }
      try { const result = await getMyOrder({ data: { accessToken: session.access_token, orderIdOrCode: id } }); if (active) setOrder(result.order); }
      catch (err) { if (active) setError(err instanceof Error ? err.message : "Không thể tải đơn hàng."); }
      finally { if (active) setLoading(false); }
    };
    void run();
    return () => { active = false; };
  }, [id]);

  return <div className="min-h-screen"><SiteNav /><main className="mx-auto max-w-4xl px-6 pb-24 pt-28 sm:px-12"><nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-silver"><Link to="/account" className="hover:text-primary">Tài khoản</Link><span>/</span><Link to="/account/orders" className="hover:text-primary">Đơn hàng</Link><span>/</span><span>Chi tiết</span></nav>{loading ? <div className="border border-border bg-card p-8 text-center text-sm text-silver">Đang tải đơn hàng…</div> : error ? <div className="border border-destructive/40 bg-destructive/5 p-6 text-sm leading-6 text-destructive">{error}</div> : !order ? <div className="border border-border p-8 text-center text-sm text-silver">Không tìm thấy đơn hàng.</div> : <><div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7"><div><p className="eyebrow">Order detail</p><h1 className="mt-2 text-3xl sm:text-4xl">{order.order_code}</h1><p className="mt-2 text-xs text-silver">{new Date(order.created_at).toLocaleString("vi-VN")}</p></div><div className="text-right"><p className="font-display text-2xl text-primary">{formatVnd(order.total)}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver">{order.order_status} · {order.payment_status}</p></div></div><section className="mt-8 border border-border bg-card p-5 sm:p-6"><p className="eyebrow">Items</p><div className="mt-4 divide-y divide-border">{order.items.map((item) => <div key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="text-sm text-beige">{item.product_name} × {item.quantity}</p><p className="mt-1 text-xs text-silver">{item.size} · {item.color}</p></div><p className="text-sm text-primary">{formatVnd(item.unit_price * item.quantity)}</p></div>)}</div><div className="mt-5 space-y-2 border-t border-border pt-5 text-sm"><div className="flex justify-between gap-4"><span className="text-silver">Tạm tính</span><span>{formatVnd(order.subtotal)}</span></div><div className="flex justify-between gap-4"><span className="text-silver">Vận chuyển</span><span>{formatVnd(order.shipping_fee)}</span></div><div className="flex justify-between gap-4 border-t border-border pt-3 font-display text-lg"><span>Tổng</span><span className="text-primary">{formatVnd(order.total)}</span></div></div></section><section className="mt-6 grid gap-6 sm:grid-cols-2"><div className="border border-border bg-card p-5"><p className="eyebrow">Delivery</p><p className="mt-3 text-sm leading-6 text-beige">{order.customer_name}<br/>{order.phone}<br/>{order.address}<br/>{order.district}, {order.city}</p></div><div className="border border-border bg-card p-5"><p className="eyebrow">Payment</p><p className="mt-3 text-sm leading-6 text-beige">Phương thức: {order.payment_method}<br/>Trạng thái: {order.payment_status}<br/>Đơn hàng: {order.order_status}</p></div></section></>}<div className="mt-8"><Link to="/account/orders" className="text-xs uppercase tracking-[0.14em] text-primary hover:underline">← Quay lại lịch sử đơn hàng</Link></div></main><SiteFooter /></div>;
}
