import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { generateWearoAiReply } from "@/lib/wearo-ai-chat.functions";

const STYLES = ["Street", "Minimal", "Smart casual", "Y2K"];
const OCCASIONS = ["Đi học", "Đi làm", "Hẹn hò", "Đi chơi"];

export const Route = createFileRoute("/ai")({
  validateSearch: (search: Record<string, unknown>): { product?: string } =>
    typeof search["product"] === "string" ? { product: search["product"] } : {},
  head: () => ({
    meta: [
      { title: "WEARO AI Studio" },
      {
        name: "description",
        content: "WEARO AI Studio — trợ lý AI giúp định hình phong cách và outfit theo cách riêng của bạn.",
      },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  const search = Route.useSearch();
  const [style, setStyle] = useState("Street");
  const [occasion, setOccasion] = useState("Đi chơi");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    const userBrief = brief.trim() || "Hãy đề xuất một outfit phù hợp với phong cách và dịp đã chọn.";
    setIsLoading(true);
    setError("");

    try {
      const response = await generateWearoAiReply({
        data: {
          messages: [
            {
              role: "user",
              content: [
                `Phong cách: ${style}`,
                `Dịp: ${occasion}`,
                search.product ? `Sản phẩm tham chiếu: ${search.product}` : "",
                `Yêu cầu: ${userBrief}`,
                "Hãy trả lời như WEARO AI Stylist: ngắn gọn, cụ thể, có cấu trúc outfit và lý do phối.",
              ]
                .filter(Boolean)
                .join("\n"),
            },
          ],
        },
      });
      setResult(response.text);
    } catch {
      setError("Chưa thể kết nối WEARO AI lúc này. Hãy thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="wearo-ai-phase2 min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="wearo-ai-page">
        <div className="wearo-ai-shell">
          <header>
            <p className="wearo-ai-kicker">WEARO / AI STUDIO · BETA</p>
            <h1 className="wearo-ai-title wearo-ai-display">
              AI <span className="wearo-ai-title-accent">Dashboard</span>
            </h1>
            <p className="wearo-ai-lede">
              Chọn phong cách, dịp sử dụng và mô tả mong muốn. WEARO AI Stylist sẽ giúp bạn định hình outfit theo cách của riêng bạn.
            </p>
          </header>

          <div className="wearo-ai-grid">
            <section className="wearo-ai-card">
              <div className="wearo-ai-card-header">
                <span className="wearo-ai-card-title">01 · Tạo concept</span>
                <span className="wearo-ai-kicker">Input</span>
              </div>

              <div className="wearo-ai-card-body">
                <div>
                  <span className="wearo-ai-field-label">Phong cách</span>
                  <div className="wearo-ai-chip-group">
                    {STYLES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="wearo-ai-chip"
                        data-active={style === item}
                        onClick={() => setStyle(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <span className="wearo-ai-field-label">Dịp sử dụng</span>
                  <div className="wearo-ai-chip-group">
                    {OCCASIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="wearo-ai-chip"
                        data-active={occasion === item}
                        onClick={() => setOccasion(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {search.product ? (
                  <div className="mt-6 border border-[rgba(84,114,140,.16)] bg-[rgba(242,206,174,.18)] p-3">
                    <span className="wearo-ai-field-label">Sản phẩm tham chiếu</span>
                    <p className="text-xs text-[#171717]">{search.product}</p>
                  </div>
                ) : null}

                <div className="mt-6">
                  <label htmlFor="wearo-ai-brief" className="wearo-ai-field-label">
                    Mô tả outfit
                  </label>
                  <textarea
                    id="wearo-ai-brief"
                    value={brief}
                    onChange={(event) => setBrief(event.target.value)}
                    className="wearo-ai-textarea"
                    placeholder="Ví dụ: form rộng, tông trung tính, phối cùng sneaker trắng…"
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="wearo-ai-helper">AI sẽ dùng các lựa chọn trên làm context cho Stylist.</p>
                  <button type="button" className="wearo-ai-generate" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? "Đang tạo…" : "Tạo concept"}
                  </button>
                </div>
              </div>
            </section>

            <aside className="wearo-ai-card wearo-ai-result">
              <div className="wearo-ai-card-header">
                <span className="wearo-ai-card-title">02 · AI Result</span>
                <span className="wearo-ai-kicker">Output</span>
              </div>

              <div className="wearo-ai-card-body">
                {error ? (
                  <div className="wearo-ai-result-empty">
                    <div>
                      <div className="wearo-ai-result-mark">!</div>
                      <h3>Không thể tạo concept</h3>
                      <p>{error}</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="min-h-[330px] border border-[rgba(84,114,140,.18)] bg-[rgba(242,206,174,.12)] p-5">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#54728C]">WEARO AI Stylist</p>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-[#171717]">{result}</p>
                  </div>
                ) : (
                  <div className="wearo-ai-result-empty">
                    <div>
                      <div className="wearo-ai-result-mark">✦</div>
                      <h3>Concept outfit của bạn sẽ ở đây</h3>
                      <p>Chọn style, dịp và brief ở bên trái rồi bấm “Tạo concept”.</p>
                    </div>
                  </div>
                )}

                <div className="wearo-ai-tools">
                  <Link to="/ai/assistant" className="wearo-ai-tool">
                    <strong>AI Stylist</strong>
                    <span>Trò chuyện trực tiếp để tinh chỉnh outfit.</span>
                  </Link>
                  <Link to="/shop" className="wearo-ai-tool">
                    <strong>Shop</strong>
                    <span>Khám phá sản phẩm sau khi có concept.</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
