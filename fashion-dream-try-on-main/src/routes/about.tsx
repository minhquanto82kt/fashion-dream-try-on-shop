import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Về WEARO — Mặc theo cách của riêng bạn" },
      { name: "description", content: "WEARO là cửa hàng thời trang trực tuyến tích hợp AI Virtual Try-On, AI Personal Stylist và Hybrid Stylist 1:1." },
      { property: "og:title", content: "WEARO — Mặc theo cách của riêng bạn" },
      { property: "og:description", content: "Thời trang cá nhân hóa với AI Virtual Try-On, AI Personal Stylist và tư vấn Stylist 1:1." },
    ],
  }),
  component: AboutPage,
});

const STATS = [
  { k: "AI", v: "Virtual Try-On trên ảnh thật" },
  { k: "SET", v: "Full-Set Outfit cá nhân hóa" },
  { k: "1:1", v: "Hybrid Stylist tư vấn trực tiếp" },
];

function AboutPage() {
  return <div className="min-h-screen"><SiteNav /><main className="pt-16">
    <section className="relative"><img src="https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="WEARO fashion editorial" className="h-[46vh] w-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" /><div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-12 sm:px-12 lg:px-20"><p className="eyebrow">About WEARO</p><h1 className="mt-3 max-w-3xl text-4xl leading-none sm:text-6xl">Mặc theo cách của <span className="text-primary">riêng bạn.</span></h1></div></section>
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-12">
      <p className="text-xl font-light leading-8 text-beige">WEARO là cửa hàng thời trang bán lẻ trực tuyến dành cho những người trẻ và người đi làm bận rộn muốn mặc đẹp, tự tin với vóc dáng cá nhân và không muốn mất quá nhiều thời gian để quyết định hôm nay mặc gì.</p>
      <p className="mt-7 text-beige leading-7">Tên gọi <strong className="text-foreground">WEARO = WEAR + O</strong>. WEAR đại diện cho trang phục và cách bạn thể hiện gu ăn mặc mỗi ngày. O mở ra ba tinh thần: <strong className="text-primary">Own</strong> — làm chủ phong cách; <strong className="text-primary">Original</strong> — giữ bản sắc nguyên bản; và <strong className="text-primary">Open</strong> — cởi mở với những xu hướng mới.</p>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">{STATS.map((s) => <div key={s.k} className="border border-border bg-card p-5"><p className="font-display text-3xl text-primary">{s.k}</p><p className="mt-2 text-sm leading-6 text-silver">{s.v}</p></div>)}</div>

      <div className="mt-14 border-y border-border py-12"><p className="eyebrow">The problem</p><h2 className="mt-3 text-3xl sm:text-4xl">Mua online không nên là một canh bạc.</h2><p className="mt-5 max-w-3xl text-beige leading-7">Khách hàng thường khó hình dung một món đồ sẽ trông như thế nào trên chính cơ thể mình, đồng thời mất thời gian phối từng món riêng lẻ. WEARO tập trung giải quyết hai pain point đó: <strong className="text-foreground">an tâm khi chọn đồ</strong> và <strong className="text-foreground">tiết kiệm thời gian khi phối đồ</strong>.</p></div>

      <div className="mt-14"><p className="eyebrow">The WEARO solution</p><div className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="border border-border bg-card p-6"><span className="text-xs tracking-[0.18em] text-primary">01 / VIRTUAL TRY-ON</span><h3 className="mt-4 text-2xl">Thấy mình trong đồ.</h3><p className="mt-3 text-sm leading-6 text-silver">Tải ảnh toàn thân và xem trang phục được ghép trực tiếp lên ảnh của chính bạn trước khi quyết định mua.</p></article>
        <article className="border border-border bg-card p-6"><span className="text-xs tracking-[0.18em] text-primary">02 / AI PERSONAL STYLIST</span><h3 className="mt-4 text-2xl">Mua cả một outfit.</h3><p className="mt-3 text-sm leading-6 text-silver">AI phân tích vóc dáng, tone màu và bối cảnh để đề xuất Full-Set gồm áo, quần/chân váy và phụ kiện theo hướng tôn dáng.</p></article>
        <article className="border border-border bg-card p-6"><span className="text-xs tracking-[0.18em] text-primary">03 / HYBRID STYLIST</span><h3 className="mt-4 text-2xl">AI gợi ý, người thật tinh chỉnh.</h3><p className="mt-3 text-sm leading-6 text-silver">Stylist hỗ trợ 1:1 qua chat để kiểm duyệt outfit, tư vấn phụ kiện và chọn size khi khách hàng cần thêm một góc nhìn chuyên môn.</p></article>
      </div></div>

      <div className="mt-14 border border-primary/40 bg-primary/5 p-7 sm:p-9"><p className="eyebrow">Core value proposition</p><blockquote className="mt-4 text-2xl leading-9 sm:text-3xl">“WEARO — Mặc theo cách của riêng bạn: Định hình phong cách cá nhân với Thử đồ ảo AI chuẩn dáng.”</blockquote><p className="mt-5 text-sm leading-6 text-silver">Dành cho người trẻ và người đi làm bận rộn từ 16–30 tuổi, WEARO kết hợp AI Virtual Try-On và AI Personal Stylist để giảm nỗi lo mua sai form, rút ngắn thời gian phối đồ và giúp khách hàng tự tin thể hiện bản sắc riêng.</p></div>

      <div className="mt-12 flex flex-wrap gap-4"><Link to="/shop" className="bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground">Khám phá WEARO</Link><Link to="/ai" className="border border-border px-7 py-3 text-xs uppercase tracking-[0.15em] text-beige hover:border-primary">Thử AI Virtual Try-On</Link></div>
    </section>
  </main><SiteFooter /></div>;
}
