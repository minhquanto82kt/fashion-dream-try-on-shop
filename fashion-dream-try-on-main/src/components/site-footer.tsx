import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import "@/styles/wearo-footer-unified.css";

const linkClass = "wearo-footer__link";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="wearo-footer" aria-label={t("Chân trang WEARO", "WEARO footer")}>
      <div className="wearo-footer__accent" aria-hidden="true" />
      <div className="wearo-footer__inner">
        <div className="wearo-footer__grid">
          <section className="wearo-footer__brand">
            <Link to="/" className="wearo-footer__logo" aria-label="WEARO home">
              <img src="/brand/wearo-logo-header.svg" alt="WEARO" />
            </Link>
            <p className="wearo-footer__description">
              {t(
                "Mặc theo cách của riêng bạn — thời trang casual, hiện đại và unisex, được hỗ trợ bởi AI.",
                "Wear it your way — casual, modern and unisex fashion supported by AI.",
              )}
            </p>
            <span className="wearo-footer__edition">WEAR + OWN / 2026</span>
          </section>

          <section className="wearo-footer__section">
            <p className="wearo-footer__kicker">01 / {t("Khám phá", "DISCOVER")}</p>
            <nav className="wearo-footer__links" aria-label={t("Khám phá", "Discover")}>
              <Link to="/shop" className={linkClass}>{t("Sản phẩm", "Products")}</Link>
              <Link to="/shop" className={linkClass}>{t("Hàng mới về", "New Arrivals")}</Link>
              <Link to="/shop" className={linkClass}>{t("Bộ sưu tập", "Collections")}</Link>
              <Link to="/ai" className={linkClass}>AI Virtual Try-On</Link>
              <Link to="/ai" className={linkClass}>AI Personal Stylist</Link>
            </nav>
          </section>

          <section className="wearo-footer__section">
            <p className="wearo-footer__kicker">02 / {t("Hỗ trợ", "SUPPORT")}</p>
            <nav className="wearo-footer__links" aria-label={t("Hỗ trợ", "Support")}>
              <Link to="/about" className={linkClass}>{t("Hướng dẫn mua hàng", "Shopping guide")}</Link>
              <Link to="/checkout" className={linkClass}>{t("Thanh toán", "Payment")}</Link>
              <Link to="/about" className={linkClass}>{t("Đổi trả & hoàn tiền", "Returns & refunds")}</Link>
              <Link to="/about" className={linkClass}>{t("Giao hàng & vận chuyển", "Shipping & delivery")}</Link>
              <Link to="/about" className={linkClass}>{t("Chính sách & điều khoản", "Policies & terms")}</Link>
            </nav>
          </section>

          <section className="wearo-footer__section wearo-footer__contact">
            <p className="wearo-footer__kicker">03 / {t("Liên hệ", "CONTACT")}</p>
            <div className="wearo-footer__contact-list">
              <a href="tel:0901246824" className="wearo-footer__contact-item">
                <Phone size={15} aria-hidden="true" />
                <span>0901 246 824</span>
              </a>
              <span className="wearo-footer__contact-item">
                <MapPin size={15} aria-hidden="true" />
                <span>{t("12 Nguyễn Văn Bảo, Phường Hạnh Thông, TP.HCM", "12 Nguyen Van Bao, Hanh Thong Ward, Ho Chi Minh City")}</span>
              </span>
              <span className="wearo-footer__contact-item">
                <Clock size={15} aria-hidden="true" />
                <span>{t("Thứ 2 — Chủ Nhật / 08:00 — 22:00", "Monday — Sunday / 08:00 — 22:00")}</span>
              </span>
            </div>
          </section>
        </div>

        <div className="wearo-footer__bottom">
          <p>{t("© 2026 WEARO — Đại học Công nghiệp TP.HCM / IUH. Bảo lưu mọi quyền.", "© 2026 WEARO — Industrial University of Ho Chi Minh City / IUH. All rights reserved.")}</p>
          <span className="wearo-footer__signature">WEARO / SAIGON <ArrowUpRight size={12} aria-hidden="true" /></span>
        </div>
      </div>
    </footer>
  );
}
