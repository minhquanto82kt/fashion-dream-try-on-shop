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
    <div className="wearo-ai-phase2 min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="wearo-ai-page">
        <div className="wearo-ai-assistant-shell">
          <div className="wearo-ai-assistant-topbar">
            <div>
              <p className="wearo-ai-kicker">WEARO / AI STYLIST · BETA</p>
              <h1 className="wearo-ai-assistant-title wearo-ai-display">Personal Style Assistant</h1>
              <p className="wearo-ai-assistant-lede">
                Hỏi về outfit, màu sắc, form dáng hoặc cách phối đồ. AI Stylist tập trung vào tư vấn; Concept AI ở trang AI Studio dùng để tạo brief có cấu trúc.
              </p>
            </div>
            <Link to="/ai" className="wearo-ai-assistant-back">← AI Studio</Link>
          </div>

          <section className="wearo-ai-assistant-card" aria-label="WEARO AI Stylist chat">
            <div className="wearo-ai-assistant-status">
              <span className="wearo-ai-status-dot" aria-hidden="true" />
              <span>WEARO AI · Stylist Beta</span>
              <span className="wearo-ai-status-note">Tư vấn phong cách</span>
            </div>
            <WearoAiAssistant />
          </section>

          <div className="wearo-ai-assistant-links">
            <span>Muốn tạo concept nhanh?</span>
            <Link to="/ai">Quay lại AI Studio →</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
