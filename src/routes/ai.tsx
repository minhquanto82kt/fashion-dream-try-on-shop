import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai")({
  component: AIPage,
});

function AIPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-5xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border p-8 md:p-14">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border">
          <Sparkles size={22} />
        </div>

        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          AI Studio
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-6xl">
          Virtual Try-On
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Upload ảnh của bạn và trải nghiệm cách AI hình dung trang phục trên
          người trước khi mua.
        </p>

        <div className="mt-10 rounded-2xl border border-dashed p-12 text-center">
          <Sparkles className="mx-auto mb-4" size={32} />

          <h2 className="text-xl font-semibold">AI Try-On workspace</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Khu vực này sẽ được kết nối với AI provider và Supabase Storage.
          </p>
        </div>
      </section>
    </main>
  );
}
