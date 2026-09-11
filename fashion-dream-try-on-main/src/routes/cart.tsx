import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { formatVnd } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Giỏ hàng | UpThink" },
      {
        name: "description",
        content:
          "Xem lại các món đồ UpThink bạn đã chọn trước khi thanh toán.",
      },
      { property: "og:title", content: "Giỏ hàng | UpThink" },
      {
        property: "og:description",
        content: "Xem lại đơn hàng UpThink của bạn.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const {
    items,
    subtotal,
    loading,
    hasStockIssues,
    setQty,
    remove,
    clear,
  } = useCart();

  const shipping =
    subtotal === 0 || subtotal >= 1000000 ? 0 : 30000;

  function handleClear() {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?",
    );

    if (confirmed) {
      clear();
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28 sm:px-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Giỏ hàng
            </h1>

            {items.length > 0 && (
              <p className="mt-2 text-sm leading-6 text-silver">
                {items.length} sản phẩm
              </p>
            )}
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex min-h-10 shrink-0 items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.15em] text-silver transition-colors hover:border-destructive hover:text-destructive"
            >
              <X className="size-3.5 shrink-0" />
              Xóa tất cả
            </button>
          )}
        </div>

        {loading && items.length === 0 ? (
          <div className="mt-10 border border-border bg-card p-8 text-center sm:p-10">
            <p className="leading-6 text-silver">
              Đang kiểm tra tồn kho...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 border border-border bg-card p-8 text-center sm:p-10">
            <p className="leading-6 text-beige">
              Giỏ hàng đang trống.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex min-h-11 items-center justify-center bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:gap-10">
            <div className="divide-y divide-border border border-border">
              {items.map((item, i) => {
                const unavailable = !item.variant || item.stock <= 0;
                const exceedsStock =
                  item.variant !== null && item.qty > item.stock;

                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex min-w-0 flex-wrap gap-4 p-4 sm:flex-nowrap"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="size-20 shrink-0 object-cover sm:size-24"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-6">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs uppercase leading-5 tracking-[0.15em] text-silver">
                        {item.size} · {item.color}
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          unavailable || exceedsStock
                            ? "text-destructive"
                            : "text-silver"
                        }`}
                      >
                        {unavailable
                          ? "Biến thể không còn khả dụng"
                          : exceedsStock
                            ? `Chỉ còn ${item.stock} sản phẩm`
                            : `Còn ${item.stock} sản phẩm`}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={item.qty <= 1}
                          onClick={() =>
                            setQty(i, item.qty - 1)
                          }
                          className="flex size-9 shrink-0 items-center justify-center border border-border disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="size-3" />
                        </button>

                        <span className="min-w-5 text-center text-sm">
                          {item.qty}
                        </span>

                        <button
                          type="button"
                          disabled={
                            unavailable || item.qty >= item.stock
                          }
                          onClick={() =>
                            setQty(i, item.qty + 1)
                          }
                          className="flex size-9 shrink-0 items-center justify-center border border-border disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="size-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="ml-1 flex size-9 shrink-0 items-center justify-center text-silver hover:text-destructive"
                          aria-label={`Xóa ${item.product.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <p className="w-full shrink-0 text-left font-display leading-tight text-primary sm:w-auto sm:max-w-[40%] sm:text-right">
                      {formatVnd(
                        item.product.price * item.qty,
                      )}
                    </p>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit border border-border bg-card p-5 sm:p-6">
              <p className="eyebrow">Tổng kết</p>

              {hasStockIssues && (
                <div className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm leading-6 text-destructive">
                  Một hoặc nhiều sản phẩm trong giỏ đã thay đổi tồn kho. Vui lòng điều chỉnh số lượng hoặc xóa sản phẩm không khả dụng trước khi thanh toán.
                </div>
              )}

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-silver">Tạm tính</span>
                  <span className="text-right">
                    {formatVnd(subtotal)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-silver">Vận chuyển</span>
                  <span className="text-right">
                    {shipping === 0
                      ? "Miễn phí"
                      : formatVnd(shipping)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4 font-display text-lg leading-tight">
                <span>Tổng</span>
                <span className="text-right text-primary">
                  {formatVnd(subtotal + shipping)}
                </span>
              </div>

              {hasStockIssues ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex min-h-11 w-full cursor-not-allowed items-center justify-center bg-primary px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-primary-foreground opacity-40"
                >
                  Kiểm tra tồn kho trước
                </button>
              ) : (
                <Link
                  to="/checkout"
                  className="mt-6 flex min-h-11 items-center justify-center bg-primary px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-primary-foreground"
                >
                  Thanh toán
                </Link>
              )}
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
