import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/ai")({
  validateSearch: (search: Record<string, unknown>): { product?: string } =>
    typeof search["product"] === "string" ? { product: search["product"] } : {},
  head: () => ({
    meta: [
      { title: "WEARO AI Studio" },
      {
        name: "description",
        content: "WEARO AI Studio — Concept AI và Virtual Try-On cho trải nghiệm thời trang cá nhân hóa.",
      },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  const search = Route.useSearch();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-6xl items-center px-4 py-24 sm:px-8">
        <section className="w-full border border-border bg-card p-6 sm:p-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">WEARO / AI Studio</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            AI <span className="text-primary">Dashboard</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-silver sm:text-base">
            Không gian AI của WEARO đang được nâng cấp. Concept AI và Virtual Try-On sẽ được hoàn thiện trong giai đoạn tiếp theo.
          </p>

          {search.product ? (
            <div className="mt-8 border border-border bg-background p-4 text-sm">
              <p className="text-[10px] uppercase tracking-[0.16em] text-silver">Sản phẩm được chọn</p>
              <p className="mt-2 font-medium text-foreground">{search.product}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex min-h-11 items-center justify-center bg-primary px-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
            >
              Về cửa hàng
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center border border-border px-5 text-xs uppercase tracking-[0.14em] text-beige hover:border-primary"
            >
              Về trang chủ
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
