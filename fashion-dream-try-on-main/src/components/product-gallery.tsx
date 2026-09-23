import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const gallery = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, gallery.length - 1)));
  }, [gallery.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") setActiveIndex((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight") setActiveIndex((current) => Math.min(gallery.length - 1, current + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gallery.length, lightbox]);

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center border border-border bg-card text-[10px] uppercase tracking-[0.14em] text-silver">
        Chưa có ảnh sản phẩm
      </div>
    );
  }

  const activeImage = gallery[activeIndex];
  const previous = () => setActiveIndex((current) => Math.max(0, current - 1));
  const next = () => setActiveIndex((current) => Math.min(gallery.length - 1, current + 1));

  return (
    <>
      <div className="min-w-0">
        <div
          className="group relative overflow-hidden border border-border bg-card"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
            if (Math.abs(delta) > 48) {
              if (delta < 0) next();
              else previous();
            }
            touchStartX.current = null;
          }}
        >
          <button
            type="button"
            className="block w-full cursor-zoom-in"
            onClick={() => setLightbox(true)}
            aria-label={`Mở ảnh ${activeIndex + 1} của ${gallery.length}`}
          >
            <img
              src={activeImage}
              alt={`${productName} — ảnh ${activeIndex + 1}`}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              loading="eager"
              decoding="async"
            />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/35 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="text-[10px] uppercase tracking-[0.14em] text-white">{activeIndex + 1} / {gallery.length}</span>
            <Maximize2 size={15} className="text-white" aria-hidden="true" />
          </div>
          {gallery.length > 1 && (
            <>
              <button type="button" onClick={previous} disabled={activeIndex === 0} className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center border border-white/30 bg-black/25 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0" aria-label="Ảnh trước"><ChevronLeft size={17} /></button>
              <button type="button" onClick={next} disabled={activeIndex === gallery.length - 1} className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center border border-white/30 bg-black/25 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0" aria-label="Ảnh tiếp theo"><ChevronRight size={17} /></button>
            </>
          )}
        </div>
        <div className="mt-4 flex max-w-full gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label={`Thư viện ${gallery.length} ảnh sản phẩm`}>
          {gallery.map((image, index) => (
            <button key={`${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`size-20 shrink-0 overflow-hidden border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === activeIndex ? "border-primary" : "border-border hover:border-primary"}`} aria-label={`Chọn ảnh ${index + 1} trong ${gallery.length}`} aria-current={index === activeIndex}>
              <img src={image} alt="" className="size-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-silver">{gallery.length} {gallery.length === 1 ? "ảnh sản phẩm" : "ảnh sản phẩm"}</p>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Xem ảnh ${productName}`} onClick={() => setLightbox(false)}>
          <div className="relative flex max-h-[92vh] max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <img src={activeImage} alt={`${productName} — ảnh ${activeIndex + 1}`} className="max-h-[88vh] max-w-[90vw] object-contain" />
            <button type="button" onClick={() => setLightbox(false)} className="absolute right-0 top-0 grid size-10 -translate-y-2 translate-x-2 place-items-center border border-white/30 bg-black/40 text-white" aria-label="Đóng ảnh">×</button>
            {gallery.length > 1 && <>
              <button type="button" onClick={previous} disabled={activeIndex === 0} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center border border-white/30 bg-black/40 text-white disabled:opacity-30" aria-label="Ảnh trước"><ChevronLeft size={20} /></button>
              <button type="button" onClick={next} disabled={activeIndex === gallery.length - 1} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center border border-white/30 bg-black/40 text-white disabled:opacity-30" aria-label="Ảnh tiếp theo"><ChevronRight size={20} /></button>
            </>}
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-white">{activeIndex + 1} / {gallery.length}</p>
          </div>
        </div>
      )}
    </>
  );
}
