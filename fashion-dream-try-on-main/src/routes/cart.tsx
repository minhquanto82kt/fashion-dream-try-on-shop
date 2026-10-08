import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import "@/styles/wearo-cart-page.scss";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Giỏ hàng | WEARO" },
      { name: "description", content: "Xem lại các món đồ WEARO bạn đã chọn trước khi thanh toán." },
      { property: "og:title", content: "Giỏ hàng | WEARO" },
      { property: "og:description", content: "Xem lại đơn hàng WEARO của bạn." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { language, t } = useI18n();
  const { items, subtotal, loading, hasStockIssues, setQty, remove, clear } = useCart();
  const shipping = subtotal === 0 || subtotal >= 1000000 ? 0 : 30000;
  const price = (value: number) => formatPrice(value, language);

  function handleClear() {
    const confirmed = window.confirm(t("Bạn có chắc muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?", "Are you sure you want to remove all products from your cart?"));
    if (confirmed) clear();
  }

  return (
    <div className="wearo-cart-page">
      <SiteNav />
      <main className="wearo-cart-main">
        <header>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="wearo-cart-kicker">{t("WEARO / GIỎ HÀNG", "WEARO / SHOPPING BAG")}</div>
              <h1 className="wearo-cart-heading">{t("Giỏ hàng", "Shopping Bag")}<span>.</span></h1>
              <p className="wearo-cart-subhead">
                {items.length > 0
                  ? `${items.length} ${t("sản phẩm đã chọn", "items selected")}. ${t("Kiểm tra lựa chọn trước khi thanh toán.", "Review your selection before checkout.")}`
                  : t("Những món đồ bạn chọn sẽ xuất hiện tại đây.", "The pieces you select will appear here.")}
              </p>
            </div>
            {items.length > 0 && (
              <button type="button" onClick={handleClear} className="wearo-cart-clear">
                <X className="size-3.5" /> {t("Xóa tất cả", "Clear all")}
              </button>
            )}
          </div>
        </header>

        {loading && items.length === 0 ? (
          <div className="wearo-cart-loading">
            <p className="wearo-cart-kicker">{t("Đang kiểm tra tồn kho", "Checking stock")}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="wearo-cart-empty">
            <div className="wearo-cart-empty-mark"><ShoppingBag className="size-5" /></div>
            <h2>{t("Giỏ hàng đang trống", "Your bag is empty")}</h2>
            <p>{t("Khám phá các thiết kế mới của WEARO và thêm món đồ đầu tiên vào giỏ.", "Explore WEARO and add your first piece to the bag.")}</p>
            <Link to="/shop" className="wearo-cart-shop-link">{t("Khám phá cửa hàng", "Explore shop")}</Link>
          </div>
        ) : (
          <div className="wearo-cart-layout">
            <section className="wearo-cart-list" aria-label={t("Sản phẩm trong giỏ", "Cart items")}>
              {items.map((item, i) => {
                const unavailable = item.stock <= 0;
                const exceedsStock = item.qty > item.stock;
                return (
                  <article key={`${item.variantId}`} className="wearo-cart-item">
                    <img src={item.product.image} alt={item.product.name} className="wearo-cart-image" />
                    <div className="min-w-0">
                      <div className="wearo-cart-item-index">0{i + 1} / WEARO</div>
                      <h2 className="wearo-cart-item-name">{item.product.name}</h2>
                      <p className="wearo-cart-meta">{item.variant.size} · {item.variant.color}</p>
                      <p className={`wearo-cart-stock ${unavailable || exceedsStock ? "is-alert" : ""}`}>
                        {unavailable
                          ? t("Biến thể không còn khả dụng", "This variant is no longer available")
                          : exceedsStock
                            ? t(`Chỉ còn ${item.stock} sản phẩm`, `Only ${item.stock} left`)
                            : t(`Còn ${item.stock} sản phẩm`, `${item.stock} in stock`)}
                      </p>
                      <div className="wearo-cart-controls">
                        <div className="wearo-cart-qty" aria-label={t("Số lượng", "Quantity")}>
                          <button type="button" disabled={item.qty <= 1} onClick={() => setQty(i, item.qty - 1)} aria-label={t("Giảm số lượng", "Decrease quantity")}><Minus className="size-3" /></button>
                          <span>{item.qty}</span>
                          <button type="button" disabled={unavailable || item.qty >= item.stock} onClick={() => setQty(i, item.qty + 1)} aria-label={t("Tăng số lượng", "Increase quantity")}><Plus className="size-3" /></button>
                        </div>
                        <button type="button" onClick={() => remove(i)} className="wearo-cart-remove" aria-label={t(`Xóa ${item.product.name}`, `Remove ${item.product.name}`)}><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                    <p className="wearo-cart-price">{price(item.product.price * item.qty)}</p>
                  </article>
                );
              })}
            </section>

            <aside className="wearo-cart-summary">
              <div className="wearo-cart-summary-label">{t("02 / Tổng kết", "02 / Order summary")}</div>
              <h2 className="wearo-cart-summary-title">{t("Đơn hàng của bạn", "Your order")}</h2>
              {hasStockIssues && (
                <div className="wearo-cart-alert">
                  {t("Một hoặc nhiều sản phẩm đã thay đổi tồn kho. Hãy điều chỉnh số lượng hoặc xóa sản phẩm không khả dụng trước khi thanh toán.", "One or more products have changed stock levels. Adjust the quantity or remove unavailable products before checkout.")}
                </div>
              )}
              <div className="wearo-cart-summary-lines">
                <div className="wearo-cart-summary-line"><span>{t("Tạm tính", "Subtotal")}</span><strong>{price(subtotal)}</strong></div>
                <div className="wearo-cart-summary-line"><span>{t("Vận chuyển", "Shipping")}</span><strong>{shipping === 0 ? t("Miễn phí", "Free") : price(shipping)}</strong></div>
              </div>
              <div className="wearo-cart-total"><span>{t("Tổng", "Total")}</span><strong>{price(subtotal + shipping)}</strong></div>
              {hasStockIssues ? (
                <div className="wearo-cart-checkout is-disabled">{t("Kiểm tra tồn kho trước", "Check stock before checkout")}</div>
              ) : (
                <Link to="/checkout" className="wearo-cart-checkout">{t("Tiến hành thanh toán", "Proceed to checkout")}</Link>
              )}
              <p className="wearo-cart-shipping-note">
                {shipping === 0
                  ? t("Đơn hàng đủ điều kiện miễn phí vận chuyển.", "Your order qualifies for free shipping.")
                  : t("Miễn phí vận chuyển cho đơn từ 1.000.000₫.", "Free shipping on orders from 1,000,000₫.")}
              </p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
