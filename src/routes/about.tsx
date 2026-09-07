import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
        About
      </p>

      <h1 className="mt-3 text-5xl font-bold">UPTHINK.</h1>

      <p className="mt-8 text-xl leading-8 text-muted-foreground">
        Nền tảng e-commerce thời trang kết hợp AI, tập trung vào virtual
        try-on và concept try-on nhằm giúp khách hàng hình dung sản phẩm
        trước khi mua.
      </p>
    </main>
  );
}
