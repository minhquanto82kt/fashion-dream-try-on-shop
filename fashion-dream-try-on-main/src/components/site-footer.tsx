import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import "@/styles/ai-studio.css";
import "@/styles/ai-studio-m2.css";
import "@/styles/ai-studio-m4.css";

const linkClass = "text-sm text-foreground/75 transition-colors hover:text-[var(--brand-accent)]";

export function SiteFooter() {
  const { t } = useI18n();
  return <footer className="wearo-footer border-t border-border bg-background px-6 py-12 sm:px-10 lg:px-16">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <section>
          <Link to="/" className="inline-flex items-center gap-3" aria-label="WEARO home">
            <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">W</span>
            <span><strong className="block font-display text-xl uppercase tracking-[0.1em] text-foreground">WEARO<span className="text-[var(--brand-accent)]">.</span></strong><small className="block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">WEAR + OWN / 2026</small></span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-foreground/70">{t("Mặc theo cách của riêng bạn — thời trang casual, hiện đại và unisex, được hỗ trợ bởi AI.", "Wear it your way — casual, modern and unisex fashion supported by AI.")}</p>
        </section>
        <section>
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">01 / {t("Khám phá", "DISCOVER")}</p>
          <nav className="flex flex-col gap-3"><Link to="/shop" className={linkClass}>{t("Sản phẩm", "Products")}</Link><Link to="/shop" className={linkClass}>{t("Hàng mới về", "New Arrivals")}</Link><Link to="/shop" className={linkClass}>{t("Bộ sưu tập", "Collections")}</Link><Link to="/ai" className={linkClass}>AI Virtual Try-On</Link><Link to="/ai" className={linkClass}>AI Personal Stylist</Link></nav>
        </section>
        <section>
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">02 / {t("Hỗ trợ", "SUPPORT")}</p>
          <nav className="flex flex-col gap-3"><Link to="/about" className={linkClass}>{t("Hướng dẫn mua hàng", "Shopping guide")}</Link><Link to="/checkout" className={linkClass}>{t("Thanh toán", "Payment")}</Link><Link to="/about" className={linkClass}>{t("Đổi trả & hoàn tiền", "Returns & refunds")}</Link><Link to="/about" className={linkClass}>{t("Giao hàng & vận chuyển", "Shipping & delivery")}</Link><Link to="/about" className={linkClass}>{t("Chính sách & điều khoản", "Policies & terms")}</Link></nav>
        </section>
        <section>
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">03 / {t("Liên hệ", "CONTACT")}</p>
          <div className="flex flex-col gap-4 text-sm text-foreground/75"><a href="tel:0901246824" className={linkClass}><Phone size={15} className="mr-2 inline" />0901 246 824</a><span className="flex gap-2 leading-5"><MapPin size={15} className="mt-0.5 shrink-0" />{t("12 Nguyễn Văn Bảo, Phường Hạnh Thông, TP.HCM", "12 Nguyen Van Bao, Hanh Thong Ward, Ho Chi Minh City")}</span><span className="flex gap-2 leading-5"><Clock size={15} className="mt-0.5 shrink-0" />{t("Thứ 2 — Chủ Nhật / 08:00 — 22:00", "Monday — Sunday / 08:00 — 22:00")}</span></div>
        </section>
      </div>
      <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-xs text-foreground/55 sm:flex-row sm:items-center sm:justify-between"><p>{t("© 2026 WEARO — Đại học Công nghiệp TP.HCM / IUH. Bảo lưu mọi quyền.", "© 2026 WEARO — Industrial University of Ho Chi Minh City / IUH. All rights reserved.")}</p><span className="uppercase tracking-[0.1em]">WEARO / SAIGON</span></div>
    </div>
  </footer>;
}
