import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, WandSparkles } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/products";
import { readPublishedSiteContent, type SiteContentFields } from "@/lib/site-content";
import { canonicalLink } from "@/lib/seo";
import "@/styles/wearo-reference-landing.css";

const REFERENCE_IMAGES = {
  hero: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
  journal1: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
  journal2: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
  journal3: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop",
};

const DEFAULT_CONTENT: SiteContentFields = {
  announcement_enabled: false,
  announcement_text: "",
  hero_eyebrow: "WEARO / IUH / SAIGON — 2026",
  hero_title: "WEAR IT YOUR WAY.",
  hero_description: "WEARO kết hợp thời trang, AI Virtual Try-On và AI Personal Stylist để bạn hình dung đúng outfit trên chính mình, chọn trọn bộ và mặc theo cách riêng.",
  hero_cta_label: "Khám phá cửa hàng",
  hero_cta_url: "/shop",
  social_title: "WEARO — Mặc theo cách của riêng bạn",
  social_description: "Thử đồ ảo AI trên ảnh thật và nhận gợi ý outfit trọn bộ theo vóc dáng, bối cảnh và gu cá nhân.",
  favicon_url: null,
  social_image_url: REFERENCE_IMAGES.hero,
};

const CATEGORIES = [
  { slug: "all", label: "Tất cả" },
  { slug: "streetwear", label: "Streetwear" },
  { slug: "casual", label: "Casual" },
  { slug: "unisex", label: "Unisex" },
  { slug: "new", label: "Hàng mới về" },
] as const;

const JOURNAL = [
  {
    image: REFERENCE_IMAGES.journal1,
    tag: "FASHION TECH",
    title: "Công nghệ AI thay đổi cách chọn size quần áo như thế nào?",
    description: "Khám phá giải pháp AI Virtual Try-On 2D giải quyết nỗi đau lệch size mua sắm trực tuyến.",
  },
  {
    image: REFERENCE_IMAGES.journal2,
    tag: "STREETWEAR TRENDS",
    title: "Phối đồ Unisex chuẩn gu cho giới trẻ đô thị 2026",
    description: "Bí quyết chọn Full-Set Outfit vừa lịch sự đi làm vừa tự tin xuống phố cuối tuần.",
  },
  {
    image: REFERENCE_IMAGES.journal3,
    tag: "AI STYLIST",
    title: "5 cách tối ưu hóa gợi ý phối đồ từ AI Personal Stylist",
    description: "Tận dụng công nghệ để định hình phong cách cá nhân độc bản.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WEARO — Mặc theo cách của riêng bạn" },
      { name: "description", content: DEFAULT_CONTENT.social_description },
      { property: "og:title", content: DEFAULT_CONTENT.social_title },
      { property: "og:description", content: DEFAULT_CONTENT.social_description },
      { property: "og:image", content: DEFAULT_CONTENT.social_image_url ?? REFERENCE_IMAGES.hero },
      { name: "twitter:image", content: DEFAULT_CONTENT.social_image_url ?? REFERENCE_IMAGES.hero },
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
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attribute, selector.includes("property=") ? selector.match(/property=\"([^\"]+)/)?.[1] ?? "" : selector.match(/name=\"([^\"]+)/)?.[1] ?? "");
      document.head.appendChild(node);
    }
    node.content = value;
  };
  if (content.social_description) setMeta('meta[name="description"]', "name", content.social_description);
  if (content.social_title) setMeta('meta[property="og:title"]', "property", content.social_title);
  if (content.social_description) setMeta('meta[property="og:description"]', "property", content.social_description);
  if (content.social_image_url) setMeta('meta[property="og:image"]', "property", content.social_image_url);
  if (content.social_image_url) setMeta('meta[name="twitter:image"]', "name", content.social_image_url);
  if (content.favicon_url) {
    let icon = document.head.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = content.favicon_url;
  }
}

function Index() {
  const [content, setContent] = useState<SiteContentFields>(DEFAULT_CONTENT);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]["slug"]>("all");

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(window.location.search);
    const previewRaw = params.get("content_data");
    if (params.get("content_preview") === "1" && previewRaw) {
      try {
        const preview = JSON.parse(previewRaw) as SiteContentFields;
        if (mounted) {
          const next = { ...DEFAULT_CONTENT, ...preview };
          setContent(next);
          applyContentMeta(next);
        }
      } catch {
        // Keep the local fallback.
      }
    } else {
      void readPublishedSiteContent().then((published) => {
        if (mounted && published) {
          const next = { ...DEFAULT_CONTENT, ...published };
          setContent(next);
          applyContentMeta(next);
        }
      }).catch(() => {
        // Static fallback keeps the landing page available.
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = PRODUCTS.filter((product) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "streetwear") return product.tags?.some((tag) => /street|utility/i.test(tag)) ?? false;
    if (activeCategory === "casual") return product.tags?.some((tag) => /casual|everyday/i.test(tag)) ?? false;
    if (activeCategory === "unisex") return product.tags?.some((tag) => /unisex/i.test(tag)) ?? false;
    return Boolean(product.badge?.toLowerCase().includes("new"));
  });

  return (
    <div className="wearo-reference-page">
      {content.announcement_enabled && content.announcement_text && (
        <div className="wearo-reference-announcement">{content.announcement_text}</div>
      )}

      {/* Existing WEARO header — intentionally unchanged. */}
      <SiteNav />

      {/* 01 / HERO — same two-column structure as the supplied HTML reference. */}
      <section className="wearo-reference-hero">
        <div className="wearo-reference-container">
          <div className="wearo-reference-hero-grid">
            <div className="wearo-reference-hero-copy">
              <div className="wearo-reference-kicker"><WandSparkles size={13} /> FASHION TECH NEXT-GEN</div>
              <h1>
                THỜI TRANG MODERN<br />
                <span>HỖ TRỢ BỞI AI.</span>
              </h1>
              <p>{content.hero_description}</p>
              <div className="wearo-reference-actions">
                <Link to="/shop" className="wearo-reference-btn">{content.hero_cta_label || "Khám phá cửa hàng"}<span>→</span></Link>
                <Link to="/ai" className="wearo-reference-btn wearo-reference-btn--outline"><WandSparkles size={14} /> AI Virtual Try-On</Link>
              </div>
              <div className="wearo-reference-stats">
                <div><strong>99.8%</strong><span>Độ chuẩn Form AI</span></div>
                <div><strong>1-Click</strong><span>Phối trọn bộ Full-Set</span></div>
                <div><strong>100%</strong><span>Chất Unisex Modern</span></div>
              </div>
            </div>

            <div className="wearo-reference-hero-visual">
              <div className="wearo-reference-image-card">
                <img src={REFERENCE_IMAGES.hero} alt="WEARO AI fashion model" fetchPriority="high" />
                <div className="wearo-reference-ai-badge"><i /> AI Virtual Try-On Active</div>
                <div className="wearo-reference-stylist-card">
                  <div className="wearo-reference-stylist-head"><strong>✦ AI Personal Stylist</strong><span>Match 98%</span></div>
                  <p>"Set đồ Oversized Jacket + Straight Cargo Pant tôn chiều cao & che khuyết điểm hiệu quả."</p>
                  <Link to="/ai">THỬ ĐỒ TRỰC TIẾP LÊN ẢNH CỦA BẠN</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 / AI STUDIO — same banner structure as the supplied HTML reference. */}
      <section id="ai-studio" className="wearo-reference-ai-banner">
        <div className="wearo-reference-container">
          <div className="wearo-reference-ai-panel">
            <div className="wearo-reference-ai-grid">
              <div>
                <span className="wearo-reference-section-label">ĐỘT PHÁ TRẢI NGHIỆM</span>
                <h2>WEARO AI STUDIO 2.0</h2>
                <p>Không còn e ngại mua hàng online không hợp form hay tốn thời gian suy nghĩ cách phối đồ. Hãy để AI Virtual Try-On giúp bạn thử trang phục lên chính ảnh chụp của mình chỉ trong vài giây.</p>
                <div className="wearo-reference-actions">
                  <Link to="/ai" className="wearo-reference-btn wearo-reference-btn--accent"><WandSparkles size={14} /> Tải Ảnh Cá Nhân Thử Đồ</Link>
                  <Link to="/ai" className="wearo-reference-btn wearo-reference-btn--dark">AI Personal Stylist</Link>
                </div>
              </div>
              <div className="wearo-reference-ai-features">
                <article><strong>◈</strong><h3>Virtual Try-On 2D</h3><p>Mô phỏng chân thực dáng áo, phom quần trực tiếp trên cơ thể bạn.</p></article>
                <article><strong>✦</strong><h3>Full-Set Outfits</h3><p>Gợi ý phối sẵn trọn bộ chuẩn phong cách Streetwear & Casual.</p></article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 / STOREFRONT — same hierarchy and filter row as the supplied HTML reference. */}
      <main id="storefront" className="wearo-reference-container wearo-reference-storefront">
        <div className="wearo-reference-storefront-head">
          <div>
            <span className="wearo-reference-section-label">WEARO COLLECTION</span>
            <h2>CỬA HÀNG SẢN PHẨM</h2>
            <p>Khám phá các thiết kế Streetwear & Unisex mới nhất hỗ trợ AI Try-On</p>
          </div>
          <div className="wearo-reference-category-tabs" aria-label="Danh mục sản phẩm">
            {CATEGORIES.map((category) => (
              <button key={category.slug} type="button" className={activeCategory === category.slug ? "is-active" : ""} onClick={() => setActiveCategory(category.slug)}>{category.label}</button>
            ))}
          </div>
        </div>

        <div className="wearo-reference-product-grid">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        <div className="wearo-reference-view-all"><Link to="/shop">XEM TẤT CẢ SẢN PHẨM</Link></div>
      </main>

      {/* 04 / JOURNAL — same three-card editorial structure as the supplied HTML reference. */}
      <section id="journal" className="wearo-reference-journal">
        <div className="wearo-reference-container">
          <div className="wearo-reference-journal-head">
            <div><span className="wearo-reference-section-label">INSIGHTS & STYLES</span><h2>WEARO JOURNAL</h2></div>
            <Link to="/about">ĐỌC THÊM →</Link>
          </div>
          <div className="wearo-reference-journal-grid">
            {JOURNAL.map((article) => (
              <article key={article.title}>
                <div className="wearo-reference-journal-image"><img src={article.image} alt={article.title} loading="lazy" /></div>
                <div className="wearo-reference-journal-copy"><span>{article.tag}</span><h3>{article.title}</h3><p>{article.description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 05 / ABOUT — same final content block as the supplied HTML reference. */}
      <section id="about" className="wearo-reference-about">
        <div className="wearo-reference-container">
          <h2>VỀ THƯƠNG HIỆU WEARO</h2>
          <p>WEARO ra đời với sứ mệnh mang đến giải pháp thời trang casual, streetwear & unisex hiện đại tiên phong tại Việt Nam. Bằng việc kết hợp tư duy thiết kế tối giản và sức mạnh của công nghệ AI, WEARO giúp bạn tự tin làm chủ phong cách cá nhân mọi lúc, mọi nơi.</p>
        </div>
      </section>

      {/* Existing WEARO footer — intentionally unchanged. */}
      <SiteFooter />
    </div>
  );
}
