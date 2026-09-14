import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PRODUCTS, formatVnd } from "@/data/products";
import { generateConcept, generateTryOn, listAiProducts } from "@/lib/ai.functions";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/ai")({
  validateSearch: (search: Record<string, unknown>): { product?: string } =>
    typeof search["product"] === "string" ? { product: search["product"] } : {},
  head: () => ({
    meta: [
      { title: "AI Lab — Concept & Virtual Try-On | UpThink" },
      {
        name: "description",
        content:
          "Tạo concept outfit bằng AI và thử đồ ảo trên ảnh của bạn trước khi mua tại UpThink.",
      },
      { property: "og:title", content: "UpThink AI Lab" },
      {
        property: "og:description",
        content: "Concept AI và Virtual Try-On cho thời trang cá nhân hóa.",
      },
    ],
  }),
  component: AiPage,
});

const STYLES = ["Street", "Minimal", "Smart casual", "Y2K"];
const OCCASIONS = ["Đi học", "Đi làm", "Hẹn hò", "Đi chơi"];

type AiProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  defaultVariant: { size: string; color: string };
};

function AiPage() {
  const search = Route.useSearch();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [mode, setMode] = useState<"concept" | "tryon">(search.product ? "tryon" : "concept");

  if (!consentAccepted) {
    return <AiConsentGate onContinue={() => setConsentAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-24 sm:px-8 sm:pt-28">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">AI Experience · Beta</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-6xl">
            Concept + <span className="text-primary">Virtual Try-On</span>
          </h1>
          <h2 className="mt-5 text-lg font-medium uppercase tracking-[0.12em] text-foreground sm:text-xl">
            AI workspace
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-beige sm:text-[15px]">
            Hai luồng trong một workspace: tạo concept outfit theo mood, hoặc thử sản phẩm UpThink
            ngay trên ảnh của bạn.
          </p>
        </header>

        <div className="mx-auto mt-9 flex w-full max-w-xl rounded-full border border-border bg-card p-1.5">
          {(["concept", "tryon"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`min-h-11 flex-1 rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
                mode === m
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-silver hover:text-foreground"
              }`}
            >
              {m === "concept" ? "Concept AI" : "Virtual Try-On"}
            </button>
          ))}
        </div>

        <section className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-[2px] border border-border bg-card">
          {mode === "concept" ? (
            <ConceptWorkspace />
          ) : (
            <TryOnWorkspace initialProduct={search.product} />
          )}
        </section>

        <p className="mx-auto mt-4 max-w-2xl text-center text-[11px] leading-5 text-silver">
          Kết quả AI mang tính tham khảo. Hình ảnh có thể khác với sản phẩm thực tế.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function AiConsentGate({ onContinue }: { onContinue: () => void }) {
  const [checked, setChecked] = useState(false);

  const rules = [
    {
      title: "Quyền sử dụng ảnh",
      text: "Chỉ tải lên hình ảnh bạn có quyền sử dụng hoặc đã được người trong ảnh cho phép.",
    },
    {
      title: "Không vi phạm pháp luật",
      text: "Không dùng AI Studio để tạo nội dung vi phạm pháp luật, xâm phạm quyền riêng tư, danh dự hoặc quyền sở hữu trí tuệ.",
    },
    {
      title: "Kết quả chỉ mang tính tham khảo",
      text: "Hình ảnh thử đồ có thể khác sản phẩm thực tế về kích thước, màu sắc hoặc độ vừa vặn.",
    },
    {
      title: "Trách nhiệm nội dung",
      text: "Không tải ảnh chứa thông tin nhạy cảm nếu không cần thiết. Bạn chịu trách nhiệm về nội dung cung cấp.",
    },
    {
      title: "Xác nhận đồng ý",
      text: "Khi tiếp tục, bạn xác nhận đã đọc, hiểu và chấp hành các quy định sử dụng AI Studio.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-3 py-8 sm:px-6 sm:py-12">
        <section className="ai-consent-panel w-full border border-border bg-card px-8 py-8 sm:px-10 sm:py-10">
          <p className="eyebrow">AI Experience · Notice</p>

          <h1 className="mt-3 text-[28px] font-semibold leading-tight text-primary sm:text-4xl">
            Quy định sử dụng AI Studio
          </h1>

          <p className="mt-3 text-sm leading-6 text-beige sm:text-[15px]">
            Để trải nghiệm AI Studio an toàn và tốt nhất, vui lòng đọc nhanh các quy định sau rồi
            xác nhận đồng ý.
          </p>

          <div className="ai-consent-rules mt-6 space-y-4 border border-border bg-background px-5 py-5 sm:px-6 sm:py-6">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-medium text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-foreground">{rule.title}</p>
                  <p className="mt-1 text-[13px] leading-5 text-silver sm:text-sm sm:leading-6">
                    {rule.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <label className="ai-consent-check">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>
              Tôi đã đọc và chấp hành các quy định sử dụng AI Studio.
            </span>
          </label>

          <button
            type="button"
            disabled={!checked}
            onClick={onContinue}
            className="mt-5 flex h-12 w-full items-center justify-center bg-primary text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tiếp tục
          </button>

          <p className="mt-4 text-center text-[11px] leading-5 text-silver">
            Bạn có thể quay lại bất cứ lúc nào bằng cách rời trang này.
          </p>
        </section>
      </main>
    </div>
  );
}

function ResultFrame({
  image,
  pending,
  emptyLabel,
  emptyHint,
}: {
  image?: string;
  pending: boolean;
  emptyLabel: string;
  emptyHint?: string;
}) {
  return (
    <div className="flex min-h-[360px] w-full items-center justify-center overflow-hidden bg-background p-4 sm:min-h-[480px] sm:p-8">
      {pending ? (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">AI đang tạo hình ảnh</p>
            <p className="mt-1.5 text-xs leading-5 text-silver">
              Quá trình có thể mất vài giây đến hơn một phút. Vui lòng đợi.
            </p>
          </div>
        </div>
      ) : image ? (
        <img
          src={image}
          alt="Kết quả AI"
          className="max-h-[600px] w-full rounded-sm object-contain"
        />
      ) : (
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-border bg-card">
            <Sparkles className="size-5 text-primary" />
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-silver">AI result</p>
          <p className="mt-3 text-[15px] leading-6 text-beige">{emptyLabel}</p>
          {emptyHint && <p className="mt-2 text-xs leading-5 text-silver">{emptyHint}</p>}
        </div>
      )}
    </div>
  );
}

function ConceptWorkspace() {
  const run = useServerFn(generateConcept);
  const { items } = useCart();
  const [style, setStyle] = useState(STYLES[0]!);
  const [occasion, setOccasion] = useState(OCCASIONS[0]!);
  const [prompt, setPrompt] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const cartProducts = useMemo(() => {
    const seen = new Set<string>();
    return items
      .map((i) => i.product)
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  }, [items]);

  const suggestions = useMemo(() => {
    const pool = [
      ...cartProducts,
      ...PRODUCTS.filter((p) => !cartProducts.some((c) => c.id === p.id)),
    ];
    const q = (query ?? "").toLowerCase();
    return pool.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [cartProducts, query]);

  const mentions = useMemo(
    () => PRODUCTS.filter((p) => prompt.includes(`@${p.name}`)).map((p) => p.id),
    [prompt],
  );

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          style,
          occasion,
          prompt: prompt || undefined,
          mentions: mentions.length ? mentions : undefined,
        },
      }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onPromptChange = (value: string) => {
    setPrompt(value);
    const caret = textRef.current?.selectionStart ?? value.length;
    const match = /@([^@\n]{0,30})$/.exec(value.slice(0, caret));
    setQuery(match ? match[1]! : null);
  };

  const insertMention = (name: string) => {
    const el = textRef.current;
    const caret = el?.selectionStart ?? prompt.length;
    const before = prompt.slice(0, caret).replace(/@([^@\n]{0,30})$/, "");
    const next = `${before}@${name} ${prompt.slice(caret)}`;
    setPrompt(next);
    setQuery(null);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = before.length + name.length + 2;
      el?.setSelectionRange(pos, pos);
    });
  };

  return (
    <>
      <ResultFrame
        image={mutation.data?.image}
        pending={mutation.isPending}
        emptyLabel="Concept outfit của bạn sẽ hiện ở đây."
        emptyHint="Chọn phong cách + dịp, viết mô tả ngắn rồi bấm Tạo concept."
      />
      <div className="border-t border-border p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-silver">Phong cách</span>
          {STYLES.map((o) => (
            <ChoiceChip key={o} value={o} active={o === style} onClick={() => setStyle(o)} />
          ))}
          <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-silver">Dịp</span>
          {OCCASIONS.map((o) => (
            <ChoiceChip key={o} value={o} active={o === occasion} onClick={() => setOccasion(o)} />
          ))}
        </div>

        {cartProducts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cartProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => insertMention(p.name)}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-beige hover:border-primary"
              >
                <img src={p.image} alt="" className="size-5 rounded-full object-cover" />
                <span className="text-primary">@</span>
                {p.name}
              </button>
            ))}
          </div>
        )}

        <div className="relative mt-3 rounded-2xl border border-border bg-background p-2 focus-within:border-primary">
          <textarea
            ref={textRef}
            rows={3}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Mô tả outfit bạn muốn… Ví dụ: style Y2K, tông đen trắng, form rộng, phối @Shadow Hoodie với sneaker trắng."
            className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-silver"
          />
          {query !== null && suggestions.length > 0 && (
            <ul className="absolute inset-x-2 top-full z-30 mt-2 max-h-56 overflow-auto rounded-xl border border-border bg-card shadow-xl">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertMention(p.name)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-beige hover:bg-background"
                  >
                    <img src={p.image} alt="" className="size-8 object-cover" />
                    <span>{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-border px-2 pt-2">
            <span className="text-[10px] text-silver">
              {mentions.length > 0
                ? `${mentions.length} sản phẩm được nhắc`
                : "AI sẽ dựa trên mô tả + mood bạn chọn"}
            </span>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="min-h-10 rounded-full bg-primary px-5 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50"
            >
              {mutation.isPending ? "Đang tạo…" : "Tạo concept"}
            </button>
          </div>
        </div>

        {mutation.data?.text && (
          <p className="mt-3 text-sm leading-6 text-beige">{mutation.data.text}</p>
        )}
      </div>
    </>
  );
}

function TryOnWorkspace({ initialProduct }: { initialProduct?: string }) {
  const run = useServerFn(generateTryOn);
  const listProducts = useServerFn(listAiProducts);
  const { add } = useCart();
  const fileRef = useRef<HTMLInputElement>(null);
  const [person, setPerson] = useState<string | null>(null);
  const [productId, setProductId] = useState(initialProduct ?? "");
  const [note, setNote] = useState("");

  const productsQuery = useQuery({
    queryKey: ["ai-products"],
    queryFn: () => listProducts(),
    staleTime: 60_000,
  });
  const products = (productsQuery.data ?? []) as AiProduct[];
  const product = products.find((p) => p.id === productId) ?? products[0];

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          personImage: person!,
          productId: product!.id,
          note: note || undefined,
        },
      }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onFileChange = (file: File | undefined) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Chỉ hỗ trợ JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Ảnh tối đa 6MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPerson(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => toast.error("Không thể đọc ảnh. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  };

  if (productsQuery.isLoading) {
    return (
      <>
        <ResultFrame pending={false} emptyLabel="Đang tải danh sách sản phẩm…" />
        <div className="border-t border-border p-6 text-sm text-silver">
          Đang đồng bộ sản phẩm đã xuất bản từ Supabase.
        </div>
      </>
    );
  }

  if (productsQuery.isError || !product) {
    return (
      <>
        <ResultFrame pending={false} emptyLabel="Chưa có sản phẩm phù hợp để thử đồ." />
        <div className="border-t border-border p-6 text-sm text-silver">
          Không thể tải sản phẩm thử đồ hoặc hiện chưa có sản phẩm đã xuất bản có hình ảnh và biến
          thể.
        </div>
      </>
    );
  }

  const resultReady = Boolean(mutation.data?.image);

  const addLookToCart = () => {
    add({
      productId: product.id,
      size: product.defaultVariant.size,
      color: product.defaultVariant.color,
      qty: 1,
    });
    toast.success("Đã thêm look vào giỏ hàng.");
  };

  return (
    <>
      <ResultFrame
        image={mutation.data?.image}
        pending={mutation.isPending}
        emptyLabel="Tải ảnh của bạn và chọn sản phẩm để xem kết quả thử đồ."
        emptyHint="Ảnh toàn thân sẽ cho kết quả chính xác hơn."
      />
      <div className="border-t border-border p-4 sm:p-6">
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
                Bước 1 · Ảnh của bạn
              </p>
              <p className="mt-1 text-xs text-silver">
                Ảnh toàn thân giúp AI nhận diện form và tỷ lệ tốt hơn.
              </p>
            </div>
            {person && (
              <span className="text-[10px] uppercase tracking-[0.14em] text-primary">
                ✓ Đã tải ảnh
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-28 w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background px-5 py-5 text-left text-sm text-beige transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Upload className="size-5 shrink-0 text-primary" />
            <span>
              <strong className="block text-sm text-foreground">
                {person ? "Đổi ảnh toàn thân" : "TẢI ẢNH TOÀN THÂN"}
              </strong>
              <span className="mt-1 block text-xs text-silver">
                JPG, PNG hoặc WebP · tối đa 6MB
              </span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              onFileChange(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
          {person && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-2">
              <img src={person} alt="Ảnh của bạn" className="size-20 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Ảnh sẵn sàng</p>
                <p className="mt-1 text-xs text-silver">Bạn có thể chọn sản phẩm bên dưới.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
                Bước 2 · Chọn sản phẩm
              </p>
              <p className="mt-1 text-xs text-silver">Chọn một sản phẩm để thử.</p>
            </div>
            <span className="text-xs text-silver">{products.length} sản phẩm</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProductId(p.id)}
                aria-pressed={p.id === product.id}
                className={`group overflow-hidden rounded-xl border text-left transition-all ${
                  p.id === product.id
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/60"
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-background">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {p.id === product.id && (
                    <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                      Đang chọn
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                  <p className="mt-1 text-xs text-primary">{formatVnd(p.price)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-silver">
                    {p.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-border bg-background p-2 focus-within:border-primary">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={400}
            placeholder="Ghi chú thêm về cách bạn muốn mặc…"
            className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-silver"
          />
          <div className="border-t border-border px-2 pt-2 text-[10px] text-silver">
            {note.length}/400
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            person ? mutation.mutate() : toast.error("Hãy tải ảnh toàn thân trước.")
          }
          disabled={mutation.isPending || !person}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="size-4" />
          {mutation.isPending ? "Đang thử đồ…" : "BẮT ĐẦU THỬ ĐỒ ẢO"}
        </button>

        {resultReady && (
          <div className="mt-5 rounded-2xl border border-primary/40 bg-primary/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
                  Kết quả đã sẵn sàng
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{product.name}</p>
                <p className="mt-1 text-xs text-silver">
                  {formatVnd(product.price)} · {product.defaultVariant.size} ·{" "}
                  {product.defaultVariant.color}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/product/$id"
                  params={{ id: product.id }}
                  className="border border-border px-3 py-2 text-xs uppercase tracking-[0.12em] text-beige hover:border-primary"
                >
                  Chi tiết
                </Link>
                <button
                  type="button"
                  onClick={addLookToCart}
                  className="bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground"
                >
                  THÊM LOOK VÀO GIỎ
                </button>
                <Link
                  to="/cart"
                  className="border border-border px-3 py-2 text-xs uppercase tracking-[0.12em] text-beige hover:border-primary"
                >
                  XEM GIỎ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ChoiceChip({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-silver hover:text-foreground"
      }`}
    >
      {value}
    </button>
  );
}
