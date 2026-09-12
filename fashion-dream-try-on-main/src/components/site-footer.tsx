import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";

const linkClass =
  "upthink-footer-link inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-[var(--brand-accent)]";

export function SiteFooter() {
  return (
    <footer className="upthink-footer border-t border-border bg-background px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.45fr_1fr_1.15fr_1fr_1.2fr] lg:gap-8 xl:gap-12">
          <section>
            <Link to="/" className="mb-5 inline-flex items-center gap-2.5" aria-label="UpThink home">
              <span className="grid size-9 place-items-center bg-primary font-display text-lg font-bold text-primary-foreground">
                U
              </span>
              <span>
                <span className="block font-display text-xl font-semibold uppercase tracking-[0.1em] text-foreground">
                  UpThink<span className="text-[var(--brand-accent)]">.</span>
                </span>
                <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  AI FASHION / 2026
                </span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-foreground/75">
              Một ý tưởng khởi nghiệp của sinh viên IUH: thời trang cá nhân hóa với AI concept và virtual try-on.
            </p>

            <div className="mt-7">
              <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-foreground/60">
                Newsletter / Member
              </p>
              <p className="mb-3 text-sm text-foreground/80">
                Nhận ưu đãi 10% cho đơn hàng đầu tiên.
              </p>
              <form
                className="flex max-w-sm border-b border-border py-2 focus-within:border-[var(--brand-accent)]"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="footer-email" className="sr-only">
                  Email nhận ưu đãi
                </label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder="EMAIL CỦA BẠN"
                  className="min-w-0 flex-1 bg-transparent text-xs uppercase tracking-[0.08em] text-foreground outline-none placeholder:text-foreground/45"
                />
                <button
                  type="submit"
                  aria-label="Đăng ký newsletter"
                  className="text-foreground transition-colors hover:text-[var(--brand-accent)]"
                >
                  <ArrowUpRight size={18} />
                </button>
              </form>
            </div>
          </section>

          <section>
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              01 / Khám phá
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/shop" className={linkClass}>Sản phẩm</Link>
              <Link to="/shop" className={linkClass}>New Arrivals</Link>
              <Link to="/shop" className={linkClass}>Collections</Link>
              <Link to="/shop" className={linkClass}>Best Sellers</Link>
              <Link to="/shop" className={linkClass}>Sale / Offers</Link>
              <Link to="/ai" className={linkClass}>AI Studio / Try-on</Link>
              <Link to="/ai" className={linkClass}>Style Guide / Lookbook</Link>
            </div>
          </section>

          <section>
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              02 / Hỗ trợ & chính sách
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/about" className={linkClass}>Hướng dẫn mua hàng</Link>
              <Link to="/checkout" className={linkClass}>Thanh toán</Link>
              <Link to="/about" className={linkClass}>Đổi trả & hoàn tiền</Link>
              <Link to="/about" className={linkClass}>Giao hàng & vận chuyển</Link>
              <Link to="/about" className={linkClass}>Chính sách bảo mật</Link>
              <Link to="/about" className={linkClass}>Điều khoản dịch vụ</Link>
            </div>
          </section>

          <section>
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              03 / Kết nối
            </p>
            <div className="flex items-center gap-3">
              <a className="upthink-footer-social" href="https://www.instagram.com/upthink.iuh" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a className="upthink-footer-social" href="https://www.tiktok.com/@upthink.iuh" target="_blank" rel="noreferrer" aria-label="TikTok">
                <span className="text-sm font-bold">TT</span>
              </a>
              <a className="upthink-footer-social" href="https://www.facebook.com/upthink.iuh" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            </div>
            <p className="mt-5 text-sm leading-6 text-foreground/70">
              Theo dõi UpThink để cập nhật các drop mới, AI styling và lookbook.
            </p>
          </section>

          <section>
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              04 / Liên hệ & cửa hàng
            </p>
            <div className="flex flex-col gap-4 text-sm text-foreground/80">
              <a href="tel:0901246824" className={linkClass}>
                <Phone size={15} />
                <span><small className="mr-1 text-[0.58rem] uppercase tracking-[0.1em] text-foreground/50">Hotline</small>0901 246 824</span>
              </a>
              <a href="mailto:hello@upthink.vn" className={linkClass}>
                <Mail size={15} />
                <span><small className="mr-1 text-[0.58rem] uppercase tracking-[0.1em] text-foreground/50">Email</small>hello@upthink.vn</span>
              </a>
              <span className="flex items-start gap-1.5 text-sm leading-5">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <span><small className="block text-[0.58rem] uppercase tracking-[0.1em] text-foreground/50">Địa chỉ</small>12 Nguyễn Văn Bảo, Phường Hạnh Thông, TP.HCM</span>
              </span>
              <span className="flex items-start gap-1.5 text-sm leading-5">
                <Clock size={15} className="mt-0.5 shrink-0" />
                <span><small className="block text-[0.58rem] uppercase tracking-[0.1em] text-foreground/50">Giờ mở cửa</small>Thứ 2 — Chủ Nhật / 08:00 — 22:00</span>
              </span>
            </div>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col gap-5 text-xs text-foreground/60 lg:flex-row lg:items-center lg:justify-between">
            <p>© 2026 UpThink — Đại học Công nghiệp TP.HCM / IUH. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2 uppercase tracking-[0.12em]">
                <span className="text-[0.58rem] text-foreground/45">Payment</span>
                <span className="border border-border px-2 py-1">COD</span>
                <span className="border border-border px-2 py-1">VIETQR</span>
              </div>
              <span className="border-l border-border pl-5 uppercase tracking-[0.1em]">VNĐ / EN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
