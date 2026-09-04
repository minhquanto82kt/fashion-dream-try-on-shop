import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/products";

const HERO_SLIDES = [
  {
    image: "https://images.pexels.com/photos/7271149/pexels-photo-7271149.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "LOOK / 001",
    title: "STREET / PERSONAL",
  },
  {
    image: "https://images.pexels.com/photos/17037339/pexels-photo-17037339.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "LOOK / 002",
    title: "AI / FITTING",
  },
  {
    image: "https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "LOOK / 003",
    title: "SAIGON / AFTER DARK",
  },
];

const HERO = HERO_SLIDES[0].image;

const COLLECTION_CATEGORIES = [
  { slug: "all", label: "All" },
  { slug: "hoodies", label: "Hoodies" },
  { slug: "tees", label: "Tees" },
  { slug: "outerwear", label: "Outerwear" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UpThink — Thời trang streetwear với AI try-on" },
      {
        name: "description",
        content:
          "UpThink: nền tảng thời trang của sinh viên IUH. Mua streetwear, tạo concept outfit bằng AI và thử đồ ảo trước khi đặt hàng.",
      },
      { property: "og:title", content: "UpThink — Nghĩ khác. Mặc chất." },
      {
        property: "og:description",
        content: "Streetwear cá nhân hóa với AI concept styling và virtual try-on.",
      },
      { property: "og:image", content: HERO },
      { name: "twitter:image", content: HERO },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeCategory, setActiveCategory] = useState<
    (typeof COLLECTION_CATEGORIES)[number]["slug"]
  >("all");
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const active = HERO_SLIDES[slide];
  const featured = PRODUCTS.slice(0, 6).filter(
    (product) => activeCategory === "all" || product.category === activeCategory,
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="min-h-screen fashion-site">
      <SiteNav />
      <header
        className="fashion-hero"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="fashion-hero__copy">
          <div className="fashion-hero__primary">
            <p className="fashion-eyebrow">01 / AI FASHION SYSTEM</p>
            <h1 className="fashion-display">
              Dress the<br /><span className="fashion-accent">future.</span>
            </h1>
            <p className="fashion-hero__lede">
              Một wardrobe được chọn theo gu của bạn — kết hợp commerce, AI styling và virtual try-on trong cùng một trải nghiệm.
            </p>
            <div className="fashion-hero__actions">
              <Link
                to="/shop"
                className="fashion-btn"
                style={{ fontFamily: "__Inter_d65c78, sans-serif", fontWeight: 700 }}
              >
                Explore collection ↗
              </Link>
              <Link
                to="/ai"
                className="fashion-btn fashion-btn--ghost"
                style={{ fontFamily: "__Inter_d65c78, sans-serif", fontWeight: 700 }}
              >
                Start AI try-on
              </Link>
            </div>
          </div>
          <div className="fashion-hero__meta">
            <span>UPTHINK / IUH</span><span>SAIGON — 2026</span><span>SYS_02 // ONLINE</span>
          </div>
        </div>
        <div className="fashion-hero__art">
          {HERO_SLIDES.map((item, index) => (
            <img
              key={item.image}
              src={item.image}
              alt="Streetwear fashion editorial"
              fetchPriority={index === 0 ? "high" : undefined}
              className={index === slide ? "is-active" : ""}
            />
          ))}
          <div className="fashion-hero__overlay" />
          <div className="fashion-hero__scan" />
          <div className="fashion-hero__hud">
            <span className="fashion-hero__status"><b /> AI VISION / LIVE</span>
            <span>{active.title}</span>
          </div>
          <span className="fashion-hero__label">{active.label}</span>
          <span className="fashion-hero__vertical">VIRTUAL FIT / PERSONAL EDIT</span>
          <div className="fashion-hero__dots" aria-label="Hero slides">
            {HERO_SLIDES.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-label={`Xem ${item.label}`}
                className={index === slide ? "is-active" : ""}
                onClick={() => setSlide(index)}
              />
            ))}
          </div>
        </div>
      </header>
      <main>
        <section className="fashion-intro-section">
          <div className="fashion-section-number">02</div>
          <div className="fashion-intro-content">
            <p className="fashion-eyebrow">From browsing to fitting</p>
            <h2 className="fashion-section-title fashion-section-title--statement">
              <span
                className="statement-line statement-line--solid"
                style={{ letterSpacing: "-1.5px", lineHeight: "50px" }}
              >
                KHÔNG CHỈ
              </span>
              <span
                className="statement-line statement-line--solid statement-line--offset"
                style={{ letterSpacing: "-1.5px", lineHeight: "90px" }}
              >
                CHỌN ĐỒ.
              </span>
              <span className="statement-line statement-line--accent-small">CHỌN CÁCH BẠN</span>
              <span className="statement-line statement-line--accent-display">XUẤT HIỆN.</span>
            </h2>
            <p className="fashion-intro-copy">
              Fashion Dream giữ AI try-on làm core. Commerce được thiết kế lại để sản phẩm, outfit và AI stylist nối liền thành một hành trình mua sắm tự nhiên.
            </p>
          </div>
        </section>

        <section className="fashion-ai-feature">
          <div className="fashion-ai-feature__visual">
            <img src="https://images.pexels.com/photos/17037339/pexels-photo-17037339.jpeg?auto=compress&cs=tinysrgb&w=1100" alt="AI outfit concept" loading="lazy" />
            <span>AI STUDIO / 01</span>
          </div>
          <div className="fashion-ai-feature__copy">
            <p className="fashion-eyebrow">Personal styling system</p>
            <h2 className="fashion-section-title">Your look,<br /><span className="fashion-accent">your logic.</span></h2>
            <p>Chọn một món đồ, đưa ảnh của bạn vào, rồi để AI giúp hình dung outfit trước khi quyết định mua.</p>
            <div className="fashion-feature-list">
              <div><b>01</b><span>Concept theo mood</span></div>
              <div><b>02</b><span>Virtual try-on</span></div>
              <div><b>03</b><span>AI styling recommendations</span></div>
            </div>
            <Link to="/ai" className="fashion-text-link">Open AI Studio ↗</Link>
          </div>
        </section>

        <section className="fashion-products-section">
          <div className="fashion-section-head">
            <div><p className="fashion-eyebrow">03 / THE COLLECTION</p><h2 className="fashion-section-title">NEW <span className="fashion-accent">DROP</span></h2></div>
            <Link to="/shop" className="fashion-text-link">View all products ↗</Link>
          </div>
          <div className="fashion-category-filters" aria-label="Danh mục sản phẩm">
            {COLLECTION_CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                className={`fashion-category-filter${activeCategory === category.slug ? " is-active" : ""}`}
                aria-pressed={activeCategory === category.slug}
                onClick={() => setActiveCategory(category.slug)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="fashion-product-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        <section className="fashion-flow">
          <div><p className="fashion-eyebrow">04 / THE EXPERIENCE</p><h2 className="fashion-section-title">See it.<br /><span className="fashion-accent">Try it.</span><br />Wear it.</h2></div>
          <div className="fashion-flow__steps">
            <div><span>01</span><h3>Discover</h3><p>Browse curated products and collections.</p></div>
            <div><span>02</span><h3>Try</h3><p>Upload your photo and visualize the fit with AI.</p></div>
            <div><span>03</span><h3>Style</h3><p>Build a complete look with AI recommendations.</p></div>
            <div><span>04</span><h3>Shop</h3><p>Add the pieces you love and check out.</p></div>
          </div>
        </section>

        <section className="fashion-editorial">
          <img src="https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="UpThink streetwear editorial" loading="lazy" />
          <div><p className="fashion-eyebrow">EDITORIAL / SAIGON</p><h2>Street is<br /><span className="fashion-accent">the studio.</span></h2><Link to="/about" className="fashion-btn fashion-btn--light">Our story ↗</Link></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
