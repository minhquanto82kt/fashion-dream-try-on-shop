import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { WearoAiAssistant } from "@/components/wearo-ai-assistant";

export const Route = createFileRoute("/ai/assistant")({
  head: () => ({
    meta: [
      { title: "WEARO AI Stylist" },
      { name: "description", content: "Trò chuyện với WEARO AI Stylist để khám phá phong cách và outfit phù hợp." },
    ],
  }),
  component: AiAssistantPage,
});

function AiAssistantPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-24 sm:px-8 sm:pt-28">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">WEARO AI · BETA</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-6xl">Your AI Stylist</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-beige sm:text-base">
            Nói cho WEARO biết bạn muốn mặc gì, đi đâu và cảm giác bạn muốn tạo ra. AI sẽ giúp bạn định hình outfit theo cách của riêng bạn.
          </p>
        </header>

        <section className="mx-auto mt-10 max-w-4xl overflow-hidden border border-border bg-card">
          <WearoAiAssistant />
        </section>

        <div className="mx-auto mt-5 flex max-w-4xl justify-between text-xs uppercase tracking-[0.14em] text-silver">
          <Link to="/ai" className="transition-colors hover:text-primary">← AI Studio</Link>
          <span>Concept + Try-On remain available</span>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
