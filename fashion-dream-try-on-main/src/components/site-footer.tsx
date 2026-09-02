import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-14 sm:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.7fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid size-8 place-items-center bg-primary font-display text-lg font-bold text-primary-foreground">
              U
            </span>
            <span className="font-display text-lg tracking-[0.12em]">UpThink</span>
          </div>
          <p className="max-w-sm text-sm text-silver">
            Một ý tưởng khởi nghiệp của sinh viên IUH: thời trang cá nhân hóa với AI concept và
            virtual try-on.
          </p>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-primary">Khám phá</p>
          <div className="flex flex-col gap-2 text-sm text-beige">
            <Link to="/shop">Sản phẩm</Link>
            <Link to="/ai">AI Lab</Link>
            <Link to="/about">Về chúng tôi</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-primary">Kết nối</p>
          <div className="flex flex-col gap-2 text-sm text-beige">
            <span>hello@upthink.vn</span>
            <span>Instagram / TikTok @upthink.iuh</span>
            <span>Đại học Công nghiệp TP.HCM</span>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-silver">
        © 2026 UpThink — Đại học Công nghiệp TP.HCM / IUH
      </p>
    </footer>
  );
}
