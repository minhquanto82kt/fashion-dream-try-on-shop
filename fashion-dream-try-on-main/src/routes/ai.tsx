import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import {
  generateTryOn,
  getTryOnJob,
  listAiProducts,
} from "@/lib/ai.functions";
import { generateWearoAiReply } from "@/lib/wearo-ai-chat.functions";

const STYLES = ["Street", "Minimal", "Smart casual", "Y2K"];
const OCCASIONS = ["Đi học", "Đi làm", "Hẹn hò", "Đi chơi"];
const CONSENT_KEY = "wearo-ai-studio-consent-v2";

type AiProduct = Awaited<ReturnType<typeof listAiProducts>>[number];
type TryOnStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

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

function AiConsent({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <main className="wearo-ai-page">
      <div className="wearo-ai-consent-shell">
        <section className="ai-consent-panel" aria-labelledby="ai-consent-title">
          <p className="eyebrow">WEARO / AI STUDIO · NOTICE</p>
          <h1 id="ai-consent-title" className="wearo-ai-display mt-3">
            Trước khi sử dụng AI Studio
          </h1>
          <p className="mt-4 text-sm leading-7">
            Đọc nhanh các quy định dưới đây. WEARO dùng AI để hỗ trợ tư vấn phong cách và tạo concept; kết quả chỉ mang tính tham khảo.
          </p>

          <div className="mt-7">
            {[
              ["01", "Chỉ tải lên hình ảnh bạn có quyền sử dụng.", "Không sử dụng hình ảnh của người khác khi chưa được cho phép."],
              ["02", "Không dùng AI để tạo nội dung vi phạm pháp luật.", "Không xâm phạm quyền riêng tư, danh dự hoặc quyền sở hữu trí tuệ."],
              ["03", "Kết quả AI có thể khác sản phẩm thực tế.", "Màu sắc, kích thước, form và hình ảnh tạo bởi AI không phải cam kết về sản phẩm."],
              ["04", "Không nhập thông tin nhạy cảm.", "Chỉ cung cấp thông tin cần thiết để WEARO tư vấn phong cách."],
              ["05", "Bạn chịu trách nhiệm về nội dung mình cung cấp.", "Khi tiếp tục, bạn xác nhận đã đọc và hiểu các quy định sử dụng AI Studio."],
            ].map(([number, title, description]) => (
              <div key={number} className="flex">
                <span className="flex shrink-0 items-center justify-center rounded-full">{number}</span>
                <div>
                  <p className="text-foreground">{title}</p>
                  <p className="text-silver">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <label className="ai-consent-check mt-6">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            <span>Tôi đã đọc, hiểu và chấp nhận các quy định sử dụng WEARO AI Studio.</span>
          </label>

          <button type="button" className="mt-4 w-full" disabled={!checked} onClick={onAccept}>
            Tiếp tục vào AI Studio
          </button>
          <p className="mt-4 text-xs leading-5">Bạn có thể rời trang bất cứ lúc nào.</p>
        </section>
      </div>
    </main>
  );
}

function TryOnStudio({
  products,
  initialProductId,
}: {
  products: AiProduct[];
  initialProductId?: string;
}) {
  const [personImage, setPersonImage] = useState("");
  const [personPreview, setPersonPreview] = useState("");
  const [productId, setProductId] = useState(initialProductId ?? products[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<TryOnStatus>("idle");
  const [resultImage, setResultImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialProductId && products.some((product) => product.id === initialProductId)) {
      setProductId(initialProductId);
    } else if (!productId && products[0]) {
      setProductId(products[0].id);
    }
  }, [initialProductId, productId, products]);

  function handlePersonImage(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Ảnh phải là JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Ảnh tối đa 6MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      setPersonImage(value);
      setPersonPreview(value);
      setResultImage("");
      setError("");
      setStatus("idle");
    };
    reader.readAsDataURL(file);
  }

  async function waitForResult(jobId: string) {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const job = await getTryOnJob({ data: { jobId } });
      if (job.status === "completed" && job.image) {
        setResultImage(job.image);
        setStatus("completed");
        return;
      }
      if (job.status === "failed") {
        throw new Error("AI Try-On thất bại. Vui lòng thử lại.");
      }
      setStatus("processing");
    }
    throw new Error("AI Try-On mất quá nhiều thời gian. Bạn có thể kiểm tra lại sau.");
  }

  async function handleTryOn() {
    if (!personImage) {
      setError("Hãy tải ảnh toàn thân hoặc ảnh người rõ ràng trước.");
      return;
    }
    if (!productId) {
      setError("Hãy chọn một sản phẩm đã được xuất bản.");
      return;
    }

    setStatus("uploading");
    setError("");
    setResultImage("");

    try {
      const job = await generateTryOn({
        data: { personImage, productId, note: note.trim() || undefined },
      });
      setStatus("processing");
      await waitForResult(job.jobId);
    } catch (tryOnError) {
      setStatus("failed");
      setError(tryOnError instanceof Error ? tryOnError.message : "Không thể thực hiện AI Try-On.");
    }
  }

  return (
    <section className="wearo-ai-card mt-6">
      <div className="wearo-ai-card-header">
        <span className="wearo-ai-card-title">03 · Virtual Try-On</span>
        <span className="wearo-ai-kicker">AI / IMAGE</span>
      </div>

      <div className="wearo-ai-card-body">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <span className="wearo-ai-field-label">Ảnh của bạn</span>
            <label className="mt-2 flex min-h-[260px] cursor-pointer items-center justify-center border border-[rgba(84,114,140,.18)] bg-[rgba(242,206,174,.10)] p-4 text-center">
              {personPreview ? (
                <img src={personPreview} alt="Ảnh người dùng đã tải lên" className="max-h-[330px] w-full object-contain" />
              ) : (
                <span className="text-sm leading-6 text-silver">
                  Tải ảnh JPG, PNG hoặc WEBP<br />
                  tối đa 6MB
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => handlePersonImage(event.target.files?.[0])}
              />
            </label>
          </div>

          <div>
            <label htmlFor="wearo-tryon-product" className="wearo-ai-field-label">Sản phẩm WEARO</label>
            <select
              id="wearo-tryon-product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="mt-2 w-full border border-[rgba(84,114,140,.18)] bg-background px-3 py-3 text-sm"
              disabled={!products.length || status === "uploading" || status === "processing"}
            >
              {!products.length ? <option value="">Chưa có sản phẩm khả dụng</option> : null}
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.category}
                </option>
              ))}
            </select>

            {productId ? (
              <div className="mt-4 border border-[rgba(84,114,140,.16)] bg-[rgba(242,206,174,.12)] p-3">
                <p className="text-xs font-semibold text-[#54728C]">SẢN PHẨM ĐƯỢC CHỌN</p>
                <p className="mt-1 text-sm text-[#171717]">
                  {products.find((product) => product.id === productId)?.name ?? "Sản phẩm"}
                </p>
              </div>
            ) : null}

            <div className="mt-5">
              <label htmlFor="wearo-tryon-note" className="wearo-ai-field-label">Ghi chú phối đồ · không bắt buộc</label>
              <textarea
                id="wearo-tryon-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={400}
                className="wearo-ai-textarea mt-2"
                placeholder="Ví dụ: giữ nguyên nền ảnh, phối tự nhiên, form hơi rộng…"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="wearo-ai-helper">
                {status === "processing" ? "WEARO đang xử lý ảnh…" : "Kết quả được tạo từ pipeline AI Try-On hiện có."}
              </p>
              <button
                type="button"
                className="wearo-ai-generate"
                onClick={handleTryOn}
                disabled={status === "uploading" || status === "processing" || !products.length}
              >
                {status === "uploading" ? "Đang gửi…" : status === "processing" ? "Đang xử lý…" : "Thử đồ bằng AI"}
              </button>
            </div>

            {error ? (
              <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800" role="alert">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-7 border-t border-[rgba(84,114,140,.14)] pt-6">
          <span className="wearo-ai-field-label">Kết quả</span>
          <div className="mt-2 min-h-[300px] border border-[rgba(84,114,140,.18)] bg-[rgba(242,206,174,.08)] p-4">
            {resultImage ? (
              <img src={resultImage} alt="Kết quả thử đồ ảo WEARO" className="mx-auto max-h-[620px] w-full object-contain" />
            ) : (
              <div className="flex min-h-[270px] items-center justify-center text-center text-sm leading-6 text-silver">
                {status === "processing" ? "Đang chờ AI hoàn tất kết quả…" : "Kết quả thử đồ ảo sẽ xuất hiện tại đây."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AiPage() {
  const search = Route.useSearch();
  const [consented, setConsented] = useState(false);
  const [consentReady, setConsentReady] = useState(false);
  const [style, setStyle] = useState("Street");
  const [occasion, setOccasion] = useState("Đi chơi");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<AiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    setConsented(window.localStorage.getItem(CONSENT_KEY) === "accepted");
    setConsentReady(true);
  }, []);

  useEffect(() => {
    if (!consented) return;
    let active = true;
    setProductsLoading(true);
    setProductsError("");
    listAiProducts()
      .then((items) => {
        if (active) setProducts(items.filter(Boolean) as AiProduct[]);
      })
      .catch(() => {
        if (active) setProductsError("Chưa thể tải danh sách sản phẩm cho AI Try-On.");
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [consented]);

  function acceptConsent() {
    window.localStorage.setItem(CONSENT_KEY, "accepted");
    setConsented(true);
  }

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
      {!consentReady ? (
        <main className="wearo-ai-page"><div className="wearo-ai-consent-shell"><div className="ai-consent-panel" aria-hidden="true" /></div></main>
      ) : !consented ? (
        <AiConsent onAccept={acceptConsent} />
      ) : (
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
                        <button key={item} type="button" className="wearo-ai-chip" data-active={style === item} onClick={() => setStyle(item)}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="wearo-ai-field-label">Dịp sử dụng</span>
                    <div className="wearo-ai-chip-group">
                      {OCCASIONS.map((item) => (
                        <button key={item} type="button" className="wearo-ai-chip" data-active={occasion === item} onClick={() => setOccasion(item)}>
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
                    <label htmlFor="wearo-ai-brief" className="wearo-ai-field-label">Mô tả outfit</label>
                    <textarea id="wearo-ai-brief" value={brief} onChange={(event) => setBrief(event.target.value)} className="wearo-ai-textarea" placeholder="Ví dụ: form rộng, tông trung tính, phối cùng sneaker trắng…" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="wearo-ai-helper">AI dùng các lựa chọn trên làm context cho Stylist.</p>
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
                      <div><div className="wearo-ai-result-mark">!</div><h3>Không thể tạo concept</h3><p>{error}</p></div>
                    </div>
                  ) : result ? (
                    <div className="min-h-[330px] border border-[rgba(84,114,140,.18)] bg-[rgba(242,206,174,.12)] p-5">
                      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#54728C]">WEARO AI Stylist</p>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-[#171717]">{result}</p>
                    </div>
                  ) : (
                    <div className="wearo-ai-result-empty">
                      <div><div className="wearo-ai-result-mark">✦</div><h3>Concept outfit của bạn sẽ ở đây</h3><p>Chọn style, dịp và brief ở bên trái rồi bấm “Tạo concept”.</p></div>
                    </div>
                  )}

                  <div className="wearo-ai-tools">
                    <Link to="/ai/assistant" className="wearo-ai-tool"><strong>AI Stylist</strong><span>Trò chuyện trực tiếp để tinh chỉnh outfit.</span></Link>
                    <Link to="/shop" className="wearo-ai-tool"><strong>Shop</strong><span>Khám phá sản phẩm sau khi có concept.</span></Link>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-6">
              {productsLoading ? (
                <section className="wearo-ai-card">
                  <div className="wearo-ai-card-body text-sm text-silver">Đang tải sản phẩm đã xuất bản cho AI Try-On…</div>
                </section>
              ) : productsError ? (
                <section className="wearo-ai-card">
                  <div className="wearo-ai-card-body text-sm text-red-700">{productsError}</div>
                </section>
              ) : (
                <TryOnStudio products={products} initialProductId={search.product} />
              )}
            </div>
          </div>
        </main>
      )}
      <SiteFooter />
    </div>
  );
}
