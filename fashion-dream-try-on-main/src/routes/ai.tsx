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
import { getStylistRecommendations } from "@/lib/stylist.functions";

const STYLES = ["Street", "Minimal", "Smart casual", "Y2K"];
const OCCASIONS = ["Đi học", "Đi làm", "Hẹn hò", "Đi chơi"];
const CONSENT_KEY = "wearo-ai-studio-consent-v2";

type AiProduct = Awaited<ReturnType<typeof listAiProducts>>[number];
type StylistRecommendation = Awaited<ReturnType<typeof getStylistRecommendations>>["recommendations"][number];
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
    <main className="wearo-ai-page min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8 lg:px-12">
        <section
          className="relative grid w-full overflow-hidden border border-[rgba(84,114,140,.18)] bg-card shadow-[0_24px_80px_rgba(84,114,140,.10)] lg:grid-cols-[.72fr_1.28fr]"
          aria-labelledby="ai-consent-title"
        >
          <div className="relative flex min-h-[260px] flex-col justify-between overflow-hidden border-b border-[rgba(84,114,140,.14)] bg-[linear-gradient(145deg,rgba(84,114,140,.96),rgba(119,148,166,.88))] p-7 text-white sm:p-10 lg:min-h-[680px] lg:border-b-0 lg:border-r lg:p-12">
            <div className="relative z-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                WEARO / AI STUDIO
              </p>
              <div className="mt-16 max-w-sm sm:mt-24">
                <p className="text-xs uppercase tracking-[0.22em] text-white/65">Personal style intelligence</p>
                <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                  Phong cách của bạn, bắt đầu từ đây.
                </h1>
                <p className="mt-6 max-w-sm text-sm leading-7 text-white/78">
                  Một không gian thử nghiệm để khám phá outfit, nhận gợi ý phối đồ và hình dung phong cách với sự hỗ trợ của AI.
                </p>
              </div>
            </div>
            <div className="relative z-10 flex items-end justify-between gap-6 pt-12">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">AI / 01</span>
              <span className="text-right text-[10px] uppercase tracking-[0.16em] text-white/60">WEARO</span>
            </div>
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full border border-white/10" />
          </div>

          <div className="p-7 sm:p-10 lg:p-14">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#54728C]">
                Notice / Before you begin
              </p>
              <h2 id="ai-consent-title" className="mt-3 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-4xl">
                Trước khi sử dụng AI Studio
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-silver">
                Vui lòng đọc nhanh các nguyên tắc dưới đây. WEARO sử dụng AI để hỗ trợ tư vấn phong cách và tạo concept; kết quả có thể khác thực tế và chỉ mang tính tham khảo.
              </p>

              <div className="mt-9 divide-y divide-[rgba(84,114,140,.14)] border-y border-[rgba(84,114,140,.14)]">
                {[
                  ["01", "Ảnh & quyền sử dụng", "Chỉ tải lên hình ảnh bạn có quyền sử dụng. Không sử dụng hình ảnh của người khác khi chưa được cho phép."],
                  ["02", "Nội dung & quyền riêng tư", "Không dùng AI để tạo nội dung vi phạm pháp luật hoặc xâm phạm quyền riêng tư, danh dự và sở hữu trí tuệ."],
                  ["03", "Kết quả AI", "Màu sắc, kích thước, form và hình ảnh tạo bởi AI có thể khác sản phẩm thực tế và không phải cam kết về sản phẩm."],
                  ["04", "Thông tin cung cấp", "Không nhập thông tin nhạy cảm. Chỉ cung cấp những thông tin cần thiết để WEARO hỗ trợ bạn."],
                  ["05", "Trách nhiệm sử dụng", "Bạn chịu trách nhiệm về nội dung mình cung cấp và xác nhận đã đọc, hiểu các quy định khi tiếp tục."],
                ].map(([number, title, description]) => (
                  <div key={number} className="grid grid-cols-[44px_1fr] gap-4 py-5 sm:grid-cols-[56px_1fr] sm:gap-5">
                    <span className="flex h-9 w-9 items-center justify-center border border-[rgba(84,114,140,.22)] text-[10px] font-semibold tracking-[0.12em] text-[#54728C] sm:h-10 sm:w-10">
                      {number}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="mt-1.5 text-xs leading-6 text-silver sm:text-sm">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <label className="mt-7 flex cursor-pointer gap-3 rounded-sm border border-[rgba(84,114,140,.16)] bg-[rgba(242,206,174,.10)] p-4 transition-colors hover:bg-[rgba(242,206,174,.18)]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => setChecked(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#54728C]"
                />
                <span className="text-xs leading-6 text-foreground sm:text-sm">
                  Tôi đã đọc, hiểu và chấp nhận các quy định sử dụng WEARO AI Studio.
                </span>
              </label>

              <button
                type="button"
                className="mt-4 flex w-full items-center justify-between border border-[#54728C] bg-[#54728C] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all duration-200 hover:bg-[#7794A6] disabled:cursor-not-allowed disabled:border-[rgba(84,114,140,.18)] disabled:bg-[rgba(84,114,140,.08)] disabled:text-silver focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54728C] focus-visible:ring-offset-2"
                disabled={!checked}
                onClick={onAccept}
              >
                <span>Tiếp tục vào AI Studio</span>
                <span aria-hidden="true" className="text-base">→</span>
              </button>
              <p className="mt-4 text-center text-[11px] leading-5 text-silver">
                Bạn có thể rời trang bất cứ lúc nào.
              </p>
            </div>
          </div>
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
            <label htmlFor="wearo-tryon-note" className="wearo-ai-field-label mt-5 block">Ghi chú</label>
            <textarea
              id="wearo-tryon-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              maxLength={240}
              placeholder="Ví dụ: giữ nguyên màu sắc và form sản phẩm."
              className="mt-2 w-full resize-none border border-[rgba(84,114,140,.18)] bg-background px-3 py-3 text-sm outline-none focus:border-[#54728C]"
              disabled={status === "uploading" || status === "processing"}
            />
            <button type="button" className="mt-4 w-full" disabled={status === "uploading" || status === "processing"} onClick={handleTryOn}>
              {status === "uploading" ? "Đang tải ảnh…" : status === "processing" ? "AI đang xử lý…" : "Bắt đầu Try-On"}
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {resultImage ? (
          <div className="mt-8 border-t border-[rgba(84,114,140,.14)] pt-6">
            <p className="wearo-ai-field-label">Kết quả</p>
            <img src={resultImage} alt="Kết quả AI Try-On" className="mt-3 max-h-[680px] w-full object-contain bg-[rgba(242,206,174,.08)]" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AiPage() {
  const [consented, setConsented] = useState(false);
  const [products, setProducts] = useState<AiProduct[]>([]);
  const [productError, setProductError] = useState("");
  const search = Route.useSearch();

  useEffect(() => {
    setConsented(window.localStorage.getItem(CONSENT_KEY) === "accepted");
  }, []);

  useEffect(() => {
    if (!consented) return;
    listAiProducts({ data: {} })
      .then(setProducts)
      .catch(() => setProductError("Không thể tải catalogue AI lúc này."));
  }, [consented]);

  function acceptConsent() {
    window.localStorage.setItem(CONSENT_KEY, "accepted");
    setConsented(true);
  }

  if (!consented) return <AiConsent onAccept={acceptConsent} />;

  return (
    <div className="wearo-ai-page">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <header className="border-b border-[rgba(84,114,140,.16)] pb-8">
          <p className="eyebrow">WEARO / AI STUDIO</p>
          <h1 className="wearo-ai-display mt-3">Khám phá phong cách của bạn.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-silver">
            Chọn phong cách, dịp sử dụng và để WEARO hỗ trợ bạn xây dựng concept, gợi ý sản phẩm và thử đồ bằng AI.
          </p>
        </header>
        {productError ? <p className="mt-5 text-sm text-red-600">{productError}</p> : null}
        <TryOnStudio products={products} initialProductId={search.product} />
      </main>
      <SiteFooter />
    </div>
  );
}
