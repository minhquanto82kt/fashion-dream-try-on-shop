import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/products";
import { readPublishedSiteContent, type SiteContentFields } from "@/lib/site-content";
import { canonicalLink } from "@/lib/seo";
import "@/styles/home-editorial.css";

const INTRO_IMAGE = "/images/fashion-5-people-bg.png";
const HERO_SLIDES = [
  { image: "https://images.pexels.com/photos/7271149/pexels-photo-7271149.jpeg?auto=compress&cs=tinysrgb&w=1920", label: "LOOK / 001", title: "WEARO / PERSONAL" },
  { image: "https://images.pexels.com/photos/17037339/pexels-photo-17037339.jpeg?auto=compress&cs=tinysrgb&w=1920", label: "LOOK / 002", title: "AI / VIRTUAL FIT" },
  { image: "https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1920", label: "LOOK / 003", title: "SAIGON / YOUR WAY" },
];
const HERO = HERO_SLIDES[0].image;
const DEFAULT_CONTENT: SiteContentFields = {
  announcement_enabled: false,
  announcement_text: "",
  hero_eyebrow: "WEARO / IUH / SAIGON — 2026",
  hero_title: "WEAR IT YOUR WAY.",
  hero_description: "WEARO kết hợp thời trang, AI Virtual Try-On và AI Personal Stylist để bạn hình dung đúng outfit trên chính mình, chọn trọn bộ và mặc theo cách riêng.",
  hero_cta_label: "Explore collection ↗",
  hero_cta_url: "/shop",
  social_title: "WEARO — Mặc theo cách của riêng bạn",
  social_description: "Thử đồ ảo AI trên ảnh thật và nhận gợi ý outfit trọn bộ theo vóc dáng, bối cảnh và gu cá nhân.",
  favicon_url: null,
  social_image_url: HERO,
};
const COLLECTION_CATEGORIES = [
  { slug: "all", label: "All" }, { slug: "hoodies", label: "Hoodies" }, { slug: "tees", label: "Tees" },
  { slug: "outerwear", label: "Outerwear" }, { slug: "cap", label: "Caps" }, { slug: "sunglass", label: "Sunglasses" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WEARO — Mặc theo cách của riêng bạn" },
      { name: "description", content: DEFAULT_CONTENT.social_description },
      { property: "og:title", content: DEFAULT_CONTENT.social_title },
      { property: "og:description", content: DEFAULT_CONTENT.social_description },
      { property: "og:image", content: DEFAULT_CONTENT.social_image_url ?? HERO },
      { name: "twitter:image", content: DEFAULT_CONTENT.social_image_url ?? HERO },
    ],
    links: [canonicalLink("/")],
  }),
  component: Index,
});

function applyContentMeta(content: SiteContentFields) {
  if (typeof document === "undefined") return;
  if (content.social_title) document.title = content.social_title;
  const setMeta = (selector: string, attribute: string, value: string) => {
    let node = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!node) { node = document.createElement("meta"); node.setAttribute(attribute, selector.includes("property=") ? selector.match(/property="([^"]+)/)?.[1] ?? "" : selector.match(/name="([^"]+)/)?.[1] ?? ""); document.head.appendChild(node); }
    node.content = value;
  };
  if (content.social_description) setMeta('meta[name="description"]', "name", content.social_description);
  if (content.social_title) setMeta('meta[property="og:title"]', "property", content.social_title);
  if (content.social_description) setMeta('meta[property="og:description"]', "property", content.social_description);
  if (content.social_image_url) setMeta('meta[property="og:image"]', "property", content.social_image_url);
  if (content.social_image_url) setMeta('meta[name="twitter:image"]', "name", content.social_image_url);
  if (content.favicon_url) {
    let icon = document.head.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!icon) { icon = document.createElement("link"); icon.rel = "icon"; document.head.appendChild(icon); }
    icon.href = content.favicon_url;
  }
}

function Index() {
  const [content, setContent] = useState<SiteContentFields>(DEFAULT_CONTENT);
  const [activeCategory, setActiveCategory] = useState<(typeof COLLECTION_CATEGORIES)[number]["slug"]>("all");
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const active = HERO_SLIDES[slide];
  const featured = PRODUCTS.filter((product) => activeCategory === "all" || product.category === activeCategory);

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(window.location.search);
    const previewRaw = params.get("content_data");
    if (params.get("content_preview") === "1" && previewRaw) {
      try {
        const preview = JSON.parse(previewRaw) as SiteContentFields;
        if (mounted) { setContent({ ...DEFAULT_CONTENT, ...preview }); applyContentMeta({ ...DEFAULT_CONTENT, ...preview }); }
      } catch { /* keep published content fallback */ }
    } else {
      void readPublishedSiteContent().then((published) => {
        if (mounted && published) { setContent({ ...DEFAULT_CONTENT, ...published }); applyContentMeta({ ...DEFAULT_CONTENT, ...published }); }
      }).catch(() => { /* static fallback keeps storefront available */ });
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => { if (isPaused) return; const timer = window.setInterval(() => setSlide((current) => (current + 1) % HERO_SLIDES.length), 5200); return () => window.clearInterval(timer); }, [isPaused]);

  return <div className="min-h-screen fashion-site">
    {content.announcement_enabled && content.announcement_text && <div className="wearo-announcement" style={{ padding: "7px 16px", textAlign: "center", fontSize: "9px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>{content.announcement_text}</div>}
    <SiteNav />
    <style>{`@media (min-width: 801px){.fashion-site .fashion-hero__copy{padding-top:clamp(78px,10vh,110px)}}`}</style>
    <header id="top" className="fashion-hero" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="fashion-hero__beams" aria-hidden="true" />
      <div className="fashion-hero__copy">
        <div className="fashion-hero__primary">
          <p className="fashion-hero__mark"><span aria-hidden="true">◇</span> / 01</p>
          <h1 className="fashion-display"><span className="fashion-display__solid">{content.hero_title.split(" ").slice(0, -2).join(" ") || content.hero_title}</span><span className="fashion-display__brush">{content.hero_title.split(" ").slice(-2).join(" ")}</span></h1>
          <p className="fashion-hero__lede">{content.hero_description}</p>
          <div className="fashion-hero__actions"><a href={content.hero_cta_url} className="fashion-btn">{content.hero_cta_label}</a><Link to="/ai" className="fashion-btn fashion-btn--ghost">Start AI try-on</Link></div>
        </div>
        <div className="fashion-hero__meta"><span>{content.hero_eyebrow}</span><span>SAIGON — 2026</span><span>SYS_02 // ONLINE</span></div>
      </div>
      <div className="fashion-hero__art">
        {HERO_SLIDES.map((item, index) => <img key={item.image} src={item.image} alt="WEARO fashion editorial" fetchPriority={index === 0 ? "high" : undefined} className={index === slide ? "is-active" : ""} />)}
        <div className="fashion-hero__overlay" /><div className="fashion-hero__scan" /><div className="fashion-hero__frame" />
        <div className="fashion-hero__badge">AI TRY-ON<br />/ BETA</div><span className="fashion-hero__label">{active.label}</span>
        <div className="fashion-hero__side-note"><span>YOUR</span><span>STYLE</span><span>YOUR</span><span>STORY</span></div><div className="fashion-hero__stories" aria-hidden="true"><span>STORIES</span><i /></div>
        <div className="fashion-hero__dots" aria-label="Hero slides">{HERO_SLIDES.map((item, index) => <button key={item.label} type="button" aria-label={`Xem ${item.label}`} className={index === slide ? "is-active" : ""} style={{ width: "44px", height: "28px", padding: "13px 8px", boxSizing: "border-box", backgroundClip: "content-box" }} onClick={() => setSlide(index)} />)}</div>
      </div><div className="fashion-hero__plus" aria-hidden="true">+</div>
    </header>

    <nav className="fashion-canvas-nav" aria-label="Homepage sections"><div className="fashion-canvas-nav__inner"><span className="fashion-canvas-nav__brand">WEARO / INDEX</span><div className="fashion-canvas-nav__links"><a href="#intro">02 / Manifesto</a><a href="#ai-studio">03 / AI Studio</a><a href="#collection">04 / Collection</a><a href="#experience">05 / Experience</a></div><a href="#top" className="fashion-canvas-nav__top">↑ TOP</a></div></nav>

    <main>
      <section id="intro" className="fashion-intro-section"><div className="fashion-intro-bg" aria-hidden="true"><img src={INTRO_IMAGE} alt="" /></div><div className="fashion-section-number">02</div><div className="fashion-intro-content"><p className="fashion-eyebrow">From choosing clothes to owning your style</p><h2 className="fashion-section-title fashion-section-title--statement"><span className="statement-line statement-line--solid">KHÔNG CHỈ</span><span className="statement-line statement-line--solid statement-line--offset">CHỌN ĐỒ.</span><span className="statement-line statement-line--accent-small">CHỌN CÁCH BẠN</span><span className="statement-line statement-line--accent-display">XUẤT HIỆN.</span></h2><p className="fashion-intro-copy">WEARO giải quyết nỗi lo mua online không hợp dáng và việc mất thời gian phối từng món. Từ thử đồ ảo trên ảnh thật đến gợi ý Full-Set theo vóc dáng và bối cảnh, mọi bước đều hướng tới một lựa chọn tự tin hơn.</p></div></section>
      <section id="ai-studio" className="fashion-ai-feature"><div className="fashion-ai-feature__visual"><img src="https://images.pexels.com/photos/17037339/pexels-photo-17037339.jpeg?auto=compress&cs=tinysrgb&w=1100" alt="WEARO AI Personal Stylist" loading="lazy" /><span>AI STUDIO / 01</span></div><div className="fashion-ai-feature__copy"><p className="fashion-eyebrow">AI Personal Stylist</p><h2 className="fashion-section-title">Your look,<br /><span className="fashion-accent">your logic.</span></h2><p>AI phân tích vóc dáng, tone màu và bối cảnh để đề xuất Full-Set Outfit — ưu tiên những lựa chọn tôn dáng, dễ mặc và phù hợp với mục đích sử dụng.</p><div className="fashion-feature-list"><div><b>01</b><span>Phân tích vóc dáng & bối cảnh</span></div><div><b>02</b><span>Virtual Try-On trên ảnh thật</span></div><div><b>03</b><span>Full-Set Outfit cá nhân hóa</span></div></div><Link to="/ai" className="fashion-text-link">Open AI Stylist ↗</Link></div></section>
      <section id="collection" className="fashion-products-section"><div className="fashion-section-head"><div><p className="fashion-eyebrow">04 / THE COLLECTION</p><h2 className="fashion-section-title fashion-collection-title">Selected pieces<span className="fashion-accent">.</span></h2></div><Link to="/shop" className="fashion-text-link">View all products ↗</Link></div><div className="fashion-category-filters" aria-label="Danh mục sản phẩm">{COLLECTION_CATEGORIES.map((category) => <button key={category.slug} type="button" className={`fashion-category-filter${activeCategory === category.slug ? " is-active" : ""}`} aria-pressed={activeCategory === category.slug} onClick={() => setActiveCategory(category.slug)}>{category.label}</button>)}</div><div className="fashion-product-grid">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      <section id="experience" className="fashion-flow"><div><p className="fashion-eyebrow">05 / THE EXPERIENCE</p><h2 className="fashion-section-title">See it.<br /><span className="fashion-accent">Try it.</span><br />Own it.</h2><p className="mt-5 max-w-md text-sm leading-6 text-beige">Từ khám phá sản phẩm đến tư vấn stylist, WEARO biến hành trình mua sắm thành một trải nghiệm cá nhân hóa thay vì chỉ bán từng món đồ.</p></div><div className="fashion-flow__steps"><div><span>01</span><h3>Discover</h3><p>Khám phá thiết kế basic, casual và streetwear phù hợp gu riêng.</p></div><div><span>02</span><h3>Try</h3><p>Tải ảnh toàn thân và hình dung trang phục trực tiếp trên chính mình.</p></div><div><span>03</span><h3>Style</h3><p>AI Personal Stylist phối Full-Set theo vóc dáng và bối cảnh.</p></div><div><span>04</span><h3>Refine</h3><p>Stylist 1:1 hỗ trợ tinh chỉnh outfit, phụ kiện và size khi cần.</p></div></div></section>
      <section className="fashion-editorial"><img src="https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="WEARO streetwear editorial" loading="lazy" /><div><p className="fashion-eyebrow">WEARO / SAIGON</p><h2>Wear is<br /><span className="fashion-accent">your identity.</span></h2><p className="mt-4 max-w-md text-sm leading-6 text-white/80">Own — Original — Open. Mặc theo cách của riêng bạn.</p><Link to="/about" className="fashion-btn fashion-btn--light">Our story ↗</Link></div></section>
    </main><SiteFooter /></div>;
}
