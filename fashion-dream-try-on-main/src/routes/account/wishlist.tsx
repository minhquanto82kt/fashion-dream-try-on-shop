import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "Yêu thích | WEARO" },
      { name: "description", content: "Các sản phẩm bạn đã lưu vào danh sách yêu thích của WEARO." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-5xl items-center justify-center px-4 py-24 sm:px-8">
        <section className="w-full max-w-xl border border-border bg-card px-6 py-12 text-center sm:px-10">
          <div className="mx-auto flex size-14 items-center justify-center border border-border">
            <Heart className="size-5 text-primary" aria-hidden="true" />
          </div>
          <p className="eyebrow mt-6">WEARO / Wishlist</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Danh sách yêu thích</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-silver">
            Tính năng lưu sản phẩm yêu thích sẽ được kết nối với tài khoản và Supabase ở bước tiếp theo.
          </p>
          <Link
            to="/shop"
            className="mt-7 inline-flex min-h-11 items-center gap-2 bg-primary px-5 py-3 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-85"
          >
            Khám phá sản phẩm <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
