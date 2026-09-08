import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-14 sm:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_0.85fr_1.05fr_1.15fr] lg:gap-x-12">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid size-8 place-items-center bg-primary font-display text-lg font-bold text-primary-foreground">
              U
            </span>
            <span className="font-display text-lg tracking-[0.12em] text-foreground">UpThink</span>
          </div>
          <p className="max-w-sm text-sm text-foreground">
            Một ý tưởng khởi nghiệp của sinh viên IUH: thời trang cá nhân hóa với AI concept và
            virtual try-on.
          </p>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-foreground">Khám phá</p>
          <div className="flex flex-col gap-2 text-sm text-foreground">
            <Link to="/shop">Sản phẩm</Link>
            <Link to="/ai">AI Lab</Link>
            <Link to="/about">Về chúng tôi</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-foreground">Kết nối</p>
          <div className="flex flex-col items-start gap-2 text-sm text-foreground">
            <a
              className="transition-opacity hover:opacity-60"
              href="https://www.instagram.com/upthink.iuh"
              target="_blank"
              rel="noreferrer"
            >
              Instagram @upthink.iuh
            </a>
            <a
              className="transition-opacity hover:opacity-60"
              href="https://www.tiktok.com/@upthink.iuh"
              target="_blank"
              rel="noreferrer"
            >
              TikTok @upthink.iuh
            </a>
            <a
              className="transition-opacity hover:opacity-60"
              href="https://www.facebook.com/upthink.iuh"
              target="_blank"
              rel="noreferrer"
            >
              Facebook / UpThink IUH
            </a>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-foreground">Liên hệ</p>
          <div className="flex flex-col gap-2 text-sm text-foreground">
            <span>
              <span className="mr-1 uppercase tracking-[0.12em]">SĐT</span>
              0901 246 824
            </span>
            <span>
              <span className="mr-1 uppercase tracking-[0.12em]">Liên hệ</span>
              hello@upthink.vn
            </span>
            <span>
              <span className="mr-1 uppercase tracking-[0.12em]">Địa chỉ</span>
              12 Nguyễn Văn Bảo, Phường Hạnh Thông, TP.HCM
            </span>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-foreground">
        © 2026 UpThink — Đại học Công nghiệp TP.HCM / IUH
      </p>
    </footer>
  );
}
