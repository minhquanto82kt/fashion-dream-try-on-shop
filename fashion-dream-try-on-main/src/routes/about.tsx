import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Về UpThink — Ý tưởng khởi nghiệp sinh viên IUH" },
      {
        name: "description",
        content:
          "UpThink là dự án khởi nghiệp của sinh viên IUH: thời trang streetwear kết hợp AI concept styling và virtual try-on.",
      },
      { property: "og:title", content: "Về UpThink" },
      {
        property: "og:description",
        content: "Câu chuyện của một thương hiệu thời trang AI-first đến từ IUH.",
      },
    ],
  }),
  component: AboutPage,
});

const STATS = [
  { k: "2026", v: "Năm khởi động dự án tại IUH" },
  { k: "8", v: "Sản phẩm trong drop đầu tiên" },
  { k: "2", v: "Công cụ AI: Concept & Try-On" },
];

function AboutPage() {
  return (
    <div className="min-h-screen fashion-site">
      <SiteNav />
      <main className="pt-28">
        <section className="relative">
          <img
            src="https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Nhóm bạn trẻ mặc streetwear trên phố"
            className="h-[46vh] w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-12 sm:px-12 lg:px-20">
            <p className="eyebrow">Về chúng tôi</p>
            <h1 className="mt-3 max-w-2xl text-4xl leading-none sm:text-5xl">
              Sinh ra từ tinh thần <span className="text-primary">dám thử</span>
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 sm:px-12">
          <p className="text-lg font-light text-beige">
            UpThink bắt đầu từ một câu hỏi rất sinh viên: làm sao để mặc đẹp mà không phải thử hàng
            chục bộ đồ, không phải trả giá đắt và vẫn giữ được cá tính riêng?
          </p>
          <p className="mt-6 text-beige">
            Chúng tôi kết hợp một bộ sưu tập streetwear được thiết kế tại Việt Nam với hai công cụ
            AI: <span className="text-primary">Concept AI</span> gợi ý outfit theo mood và dịp sử
            dụng, và <span className="text-primary">Virtual Try-On</span> cho phép bạn nhìn thấy
            chính mình trong bộ đồ trước khi đặt hàng. Ít trả hàng hơn, ít lãng phí hơn, tự tin hơn.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.k} className="border border-border bg-card p-5">
                <p className="font-display text-3xl text-primary">{s.k}</p>
                <p className="mt-2 text-sm text-silver">{s.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
            >
              Xem bộ sưu tập
            </Link>
            <Link
              to="/ai"
              className="border border-border px-7 py-3 text-xs uppercase tracking-[0.15em] text-beige hover:border-primary"
            >
              Thử AI stylist
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
