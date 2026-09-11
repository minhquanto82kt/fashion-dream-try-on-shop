import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, type RefObject } from "react";
import { Loader2, Upload } from "lucide-react";
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
      { name: "description", content: "Tạo concept outfit bằng AI và thử đồ ảo trên ảnh của bạn trước khi mua tại UpThink." },
      { property: "og:title", content: "UpThink AI Lab" },
      { property: "og:description", content: "Concept AI và Virtual Try-On cho thời trang cá nhân hóa." },
    ],
  }),
  component: AiPage,
});

const STYLES = ["Street", "Minimal", "Smart casual", "Y2K"];
const OCCASIONS = ["Đi học", "Đi làm", "Hẹn hò", "Đi chơi"];

type ConceptProduct = (typeof PRODUCTS)[number];
type AiProduct = { id: string; name: string; category: string; price: number; image: string };

function AiPage() {
  const search = Route.useSearch();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [mode, setMode] = useState<"concept" | "tryon">(search.product ? "tryon" : "concept");

  if (!consentAccepted) return <AiConsentGate onContinue={() => setConsentAccepted(true)} />;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-24 sm:px-8 sm:pt-28">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">AI Experience · Beta</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-6xl">Concept + <span className="text-primary">Virtual Try-On</span></h1>
          <h2 className="mt-5 text-lg font-medium uppercase tracking-[0.12em] text-foreground sm:text-xl">AI workspace</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-beige sm:text-[15px]">Hai luồng trong một workspace: tạo concept outfit theo mood, hoặc thử sản phẩm UpThink ngay trên ảnh của bạn.</p>
        </header>
        <div className="mx-auto mt-9 flex w-full max-w-xl rounded-full border border-border bg-card p-1.5">
          {(["concept", "tryon"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`min-h-11 flex-1 rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-silver hover:text-foreground"}`}>
              {m === "concept" ? "Concept AI" : "Virtual Try-On"}
            </button>
          ))}
        </div>
        <section className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-[2px] border border-border bg-card">
          {mode === "concept" ? <ConceptWorkspace /> : <TryOnWorkspace initialProduct={search.product} />}
        </section>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[11px] leading-5 text-silver">Kết quả AI mang tính tham khảo. Hình ảnh có thể khác với sản phẩm thực tế.</p>
      </main>
      <SiteFooter />
    </div>
  );
}

function AiConsentGate({ onContinue }: { onContinue: () => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="flex min-h-[calc(100vh-5rem)] items-center px-6 py-24 sm:px-12">
        <section className="mx-auto w-full max-w-3xl border border-border bg-card p-6 sm:p-10">
          <p className="eyebrow">AI Experience · Notice</p><h1 className="mt-3 text-4xl leading-tight sm:text-6xl">AI Studio</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-beige sm:text-base">Trước khi sử dụng AI Studio, vui lòng đọc thông tin dưới đây và xác nhận rằng bạn đồng ý tuân thủ các quy định sử dụng.</p>
          <div className="mt-8 max-h-72 overflow-y-auto border border-border bg-background p-5 text-sm leading-7 text-silver sm:p-6">
            <h2 className="font-medium text-foreground">Quy định sử dụng AI Studio</h2>
            <div className="mt-4 space-y-4"><p>1. Bạn chỉ nên tải lên hình ảnh mà bạn có quyền sử dụng hoặc đã được người trong ảnh cho phép sử dụng.</p><p>2. Không sử dụng AI Studio để tạo nội dung vi phạm pháp luật, xâm phạm quyền riêng tư, danh dự hoặc quyền sở hữu trí tuệ của người khác.</p><p>3. Kết quả AI chỉ mang tính tham khảo. Hình ảnh thử đồ có thể khác với sản phẩm thực tế và không được xem là cam kết về kích thước, màu sắc hoặc độ vừa vặn.</p><p>4. Không tải lên hình ảnh chứa thông tin nhạy cảm nếu không cần thiết. Bạn chịu trách nhiệm về nội dung hình ảnh và thông tin bạn cung cấp cho hệ thống.</p><p>5. Khi tiếp tục, bạn xác nhận đã đọc, hiểu và chấp hành các quy định sử dụng AI Studio.</p></div>
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-beige"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1 size-4 shrink-0 accent-primary" /><span>Tôi đã đọc và chấp hành các quy định sử dụng AI Studio.</span></label>
          <button type="button" disabled={!checked} onClick={onContinue} className="mt-7 flex min-h-12 w-full items-center justify-center bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40">Tiếp tục</button>
        </section>
      </main>
    </div>
  );
}

function ResultFrame({ image, pending, emptyLabel }: { image?: string; pending: boolean; emptyLabel: string }) {
  return <div className="flex min-h-[380px] w-full items-center justify-center overflow-hidden bg-background p-4 sm:min-h-[520px] sm:p-8">
    {pending ? <div className="flex flex-col items-center gap-4 px-6 text-center text-silver"><Loader2 className="size-7 animate-spin text-primary" /><div><p className="text-sm font-medium text-foreground">AI đang tạo hình ảnh</p><p className="mt-1 text-xs leading-5 text-silver">Quá trình có thể mất một chút thời gian.</p></div></div> : image ? <img src={image} alt="Kết quả AI" className="max-h-[600px] w-full rounded-sm object-contain" /> : <div className="max-w-md px-8 text-center"><p className="text-xs uppercase tracking-[0.18em] text-silver">AI result</p><p className="mt-3 text-base leading-7 text-beige">{emptyLabel}</p><p className="mt-2 text-xs leading-5 text-silver">Kết quả sẽ xuất hiện tại đây sau khi bạn gửi yêu cầu.</p></div>}
  </div>;
}

function ConceptWorkspace() {
  const run = useServerFn(generateConcept); const { items } = useCart();
  const [style, setStyle] = useState(STYLES[0]!); const [occasion, setOccasion] = useState(OCCASIONS[0]!); const [prompt, setPrompt] = useState(""); const [query, setQuery] = useState<string | null>(null); const textRef = useRef<HTMLTextAreaElement>(null);
  const cartProducts = useMemo(() => { const seen = new Set<string>(); return items.map((i) => i.product).filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))); }, [items]);
  const suggestions = useMemo(() => { const pool = [...cartProducts, ...PRODUCTS.filter((p) => !cartProducts.some((c) => c.id === p.id))]; const q = (query ?? "").toLowerCase(); return pool.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6); }, [cartProducts, query]);
  const mentions = useMemo(() => PRODUCTS.filter((p) => prompt.includes(`@${p.name}`)).map((p) => p.id), [prompt]);
  const mutation = useMutation({ mutationFn: () => run({ data: { style, occasion, prompt: prompt || undefined, mentions: mentions.length ? mentions : undefined } }), onError: (e: Error) => toast.error(e.message) });
  const onPromptChange = (value: string) => { setPrompt(value); const caret = textRef.current?.selectionStart ?? value.length; const match = /@([^@\n]{0,30})$/.exec(value.slice(0, caret)); setQuery(match ? match[1]! : null); };
  const insertMention = (name: string) => { const el = textRef.current; const caret = el?.selectionStart ?? prompt.length; const before = prompt.slice(0, caret).replace(/@([^@\n]{0,30})$/, ""); const next = `${before}@${name} ${prompt.slice(caret)}`; setPrompt(next); setQuery(null); requestAnimationFrame(() => { el?.focus(); const pos = before.length + name.length + 2; el?.setSelectionRange(pos, pos); }); };
  return <>
    <ResultFrame image={mutation.data?.image} pending={mutation.isPending} emptyLabel="Concept outfit của bạn sẽ hiện ở đây." />
    <div className="border-t border-border p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] uppercase tracking-[0.18em] text-silver">Phong cách</span>{STYLES.map((o) => <ChoiceChip key={o} value={o} active={o === style} onClick={() => setStyle(o)} />)}<span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-silver">Dịp</span>{OCCASIONS.map((o) => <ChoiceChip key={o} value={o} active={o === occasion} onClick={() => setOccasion(o)} />)}</div>
      {cartProducts.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{cartProducts.map((p) => <button key={p.id} type="button" onClick={() => insertMention(p.name)} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-beige hover:border-primary"><img src={p.image} alt="" className="size-5 rounded-full object-cover" /><span className="text-primary">@</span>{p.name}</button>)}</div>}
      <div className="relative mt-3 rounded-2xl border border-border bg-background p-2 focus-within:border-primary"><textarea ref={textRef} rows={3} value={prompt} onChange={(e) => onPromptChange(e.target.value)} placeholder="Mô tả outfit bạn muốn tạo… Ví dụ: phối @Shadow Hoodie với quần cargo rộng, sneaker trắng." className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-silver" />
        {query !== null && suggestions.length > 0 && <ul className="absolute inset-x-2 top-full z-30 mt-2 max-h-56 overflow-auto rounded-xl border border-border bg-card shadow-xl">{suggestions.map((p) => <li key={p.id}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMention(p.name)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-beige hover:bg-background"><img src={p.image} alt="" className="size-8 object-cover" /><span>{p.name}</span></button></li>)}</ul>}
        <div className="flex items-center justify-between gap-3 border-t border-border px-2 pt-2"><span className="text-[10px] text-silver">{mentions.length > 0 ? `${mentions.length} sản phẩm được nhắc` : "AI sẽ dựa trên mô tả của bạn"}</span><button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="min-h-10 rounded-full bg-primary px-5 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50">{mutation.isPending ? "Đang tạo…" : "Tạo concept"}</button></div>
      </div>
      {mutation.data?.text && <p className="mt-3 text-sm leading-6 text-beige">{mutation.data.text}</p>}
    </div>
  </>;
}

function TryOnWorkspace({ initialProduct }: { initialProduct?: string }) {
  const run = useServerFn(generateTryOn); const listProducts = useServerFn(listAiProducts); const { add } = useCart(); const fileRef = useRef<HTMLInputElement>(null);
  const [person, setPerson] = useState<string | null>(null); const [productId, setProductId] = useState(initialProduct ?? ""); const [note, setNote] = useState("");
  const productsQuery = useQuery({ queryKey: ["ai-products"], queryFn: () => listProducts(), staleTime: 60_000 });
  const products = (productsQuery.data ?? []) as AiProduct[];
  const product = products.find((p) => p.id === productId) ?? products[0];
  const mutation = useMutation({ mutationFn: () => run({ data: { personImage: person!, productId: product!.id, note: note || undefined } }), onError: (e: Error) => toast.error(e.message) });

  const onFileChange = (file: File | undefined) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Chỉ hỗ trợ JPG, PNG hoặc WEBP."); return; }
    if (file.size > 6 * 1024 * 1024) { toast.error("Ảnh tối đa 6MB."); return; }
    const reader = new FileReader(); reader.onload = () => setPerson(typeof reader.result === "string" ? reader.result : null); reader.onerror = () => toast.error("Không thể đọc ảnh. Vui lòng thử lại."); reader.readAsDataURL(file);
  };

  if (productsQuery.isLoading) return <><ResultFrame pending={false} emptyLabel="Đang tải danh sách sản phẩm…" /><div className="border-t border-border p-6 text-sm text-silver">Đang đồng bộ sản phẩm đã xuất bản từ Supabase.</div></>;
  if (productsQuery.isError || !product) return <><ResultFrame pending={false} emptyLabel="Chưa có sản phẩm phù hợp để thử đồ." /><div className="border-t border-border p-6 text-sm text-silver">Không thể tải sản phẩm thử đồ hoặc hiện chưa có sản phẩm đã xuất bản có hình ảnh.</div></>;

  return <>
    <ResultFrame image={mutation.data?.image} pending={mutation.isPending} emptyLabel="Tải ảnh của bạn và chọn sản phẩm để xem kết quả thử đồ." />
    <div className="border-t border-border p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-xs uppercase tracking-[0.12em] text-beige hover:border-primary"><Upload className="size-4" />{person ? "Đổi ảnh" : "Tải ảnh toàn thân"}</button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { onFileChange(e.target.files?.[0]); e.currentTarget.value = ""; }} />
        {products.map((p) => <button key={p.id} type="button" onClick={() => setProductId(p.id)} className={`rounded-full border px-3 py-2 text-xs ${p.id === product.id ? "border-primary text-primary" : "border-border text-beige hover:border-primary"}`}>{p.name}</button>)}
      </div>
      {person && <div className="mt-3 flex items-center gap-3"><img src={person} alt="Ảnh của bạn" className="size-16 rounded-lg object-cover" /><span className="text-xs text-silver">Ảnh đã sẵn sàng để thử {product.name}</span></div>}
      <div className="mt-4 rounded-2xl border border-border bg-background p-2 focus-within:border-primary"><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={400} placeholder="Ghi chú thêm về cách bạn muốn mặc…" className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-silver" />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-2 pt-2"><div className="min-w-0 text-xs text-silver"><span className="text-foreground">{product.name}</span> · {formatVnd(product.price)}</div><button type="button" onClick={() => (person ? mutation.mutate() : toast.error("Hãy tải ảnh của bạn trước."))} disabled={mutation.isPending} className="min-h-10 rounded-full bg-primary px-5 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50">{mutation.isPending ? "Đang thử…" : "Thử đồ ngay"}</button></div>
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-2"><Link to="/product/$id" params={{ id: product.id }} className="border border-border px-3 py-2 text-xs uppercase tracking-[0.12em] text-beige hover:border-primary">Chi tiết</Link><button type="button" onClick={() => { add({ productId: product.id, size: "M", color: "Default", qty: 1 }); toast.success("Đã thêm vào giỏ"); }} className="bg-primary px-3 py-2 text-xs uppercase tracking-[0.12em] text-primary-foreground">Thêm giỏ</button></div>
    </div>
  </>;
}

function ChoiceChip({ value, active, onClick }: { value: string; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-silver hover:text-foreground"}`}>{value}</button>; }

function Choices({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) { return <div><p className="text-xs uppercase tracking-[0.2em] text-silver">{label}</p><div className="mt-3 flex flex-wrap gap-2">{options.map((o) => <ChoiceChip key={o} value={o} active={o === value} onClick={() => onChange(o)} />)}</div></div>; }
