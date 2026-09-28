import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock3, Gift, History, Sparkles, WandSparkles } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Tài khoản thành viên | WEARO" },
      {
        name: "description",
        content:
          "Khám phá lợi ích khi đăng ký tài khoản trên nền tảng thời trang cá nhân hóa của WEARO.",
      },
    ],
  }),
  component: MembershipPage,
});

const benefits = [
  {
    icon: Gift,
    title: "Nhiều lựa chọn voucher hơn",
    text: "Tài khoản thành viên có thể nhận và lưu các voucher dành riêng cho khách hàng đăng ký, giúp việc mua sắm linh hoạt hơn.",
  },
  {
    icon: History,
    title: "Lưu lịch sử mua hàng",
    text: "Theo dõi các đơn hàng đã mua để dễ xem lại sản phẩm, tổng chi tiêu và những lựa chọn thời trang trước đây.",
  },
  {
    icon: Sparkles,
    title: "Gợi ý sản phẩm cá nhân hóa",
    text: "Hệ thống có thể sử dụng lịch sử mua hàng và tương tác để ưu tiên hiển thị những sản phẩm phù hợp với sở thích của bạn.",
  },
  {
    icon: WandSparkles,
    title: "AI Personal Stylist",
    text: "Thành viên có thể sử dụng AI Personal Stylist để nhận gợi ý outfit dựa trên phong cách, hoàn cảnh và nhu cầu cá nhân.",
  },
  {
    icon: Sparkles,
    title: "AI Virtual Try-On nâng cao",
    text: "Trải nghiệm thử đồ ảo với nhiều ngữ cảnh cá nhân hóa hơn thay vì chỉ xem ảnh sản phẩm thông thường.",
  },
  {
    icon: Clock3,
    title: "Trải nghiệm ngày càng phù hợp",
    text: "Khi có thêm dữ liệu mua sắm, nền tảng có cơ sở để cải thiện các đề xuất và giúp bạn tìm sản phẩm nhanh hơn.",
  },
];

function MembershipPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-28 sm:px-12">
        <section className="max-w-3xl">
          <p className="eyebrow">WEARO MEMBERSHIP</p>
          <h1 className="mt-3 text-4xl leading-none sm:text-6xl">
            Đăng ký một lần, <span className="text-primary">cá nhân hóa nhiều hơn.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-beige sm:text-base">
            Không bắt buộc phải tạo tài khoản để mua hàng. Tuy nhiên, tài khoản thành viên giúp
            WEARO ghi nhớ hành trình mua sắm của bạn để mở thêm các tiện ích cá nhân hóa trong
            những lần truy cập sau.
          </p>
        </section>

        <section className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="bg-card p-6 sm:p-7">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-6 text-lg font-medium">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-silver">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 grid gap-8 border-y border-border py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">GUEST → MEMBER</p>
            <h2 className="mt-3 text-3xl">Khác biệt nằm ở dữ liệu cá nhân hóa.</h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-beige">
            <p>
              <span className="text-primary">Khách vãng lai:</span> có thể mua sản phẩm mà không
              cần đăng ký tài khoản và sử dụng Virtual Try-On cơ bản.
            </p>
            <p>
              <span className="text-primary">Thành viên:</span> có hồ sơ tài khoản để gắn lịch sử
              mua hàng, voucher và các tính năng AI cá nhân hóa với cùng một người dùng.
            </p>
            <p>
              <span className="text-primary">Lưu ý:</span> các quyền lợi AI, voucher và đề xuất
              cá nhân hóa trên trang này là định hướng trải nghiệm thành viên; hệ thống chỉ nên
              mở quyền khi backend, Auth và dữ liệu Supabase tương ứng đã được triển khai.
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/shop"
            className="bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground"
          >
            Khám phá sản phẩm
          </Link>
          <Link
            to="/ai"
            className="border border-border px-6 py-3 text-xs uppercase tracking-[0.15em] text-beige hover:border-primary"
          >
            Trải nghiệm AI
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
