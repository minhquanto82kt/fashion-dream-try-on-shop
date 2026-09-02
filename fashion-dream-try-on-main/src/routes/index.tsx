import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, PRODUCTS } from "@/data/products";

const HERO =
  "https://images.pexels.com/photos/7271149/pexels-photo-7271149.jpeg?auto=compress&cs=tinysrgb&w=1920";

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
  const featured = PRODUCTS.slice(0, 6);

  return (
    <div className="min-h-screen fashion-site">
      <SiteNav />
      <header className="fashion-hero">
        <div className="fashion-hero__copy">
          <div>
            <p className="fashion-eyebrow">01 / AI FASHION SYSTEM</p>
            <h1 className="fashion-display">
              Dress the<br /><i>future.</i>
            </h1>
            <p className="fashion-hero__lede">
              Một wardrobe được chọn theo gu của bạn — kết hợp commerce, AI styling và virtual try-on trong cùng một trải nghiệm.
            </p>
          </div>
          <div className="fashion-hero__actions">
            <Link to="/shop" className="fashion-btn">Explore collection ↗</Link>
            <Link to="/ai" className="fashion-btn fashion-btn--ghost">Start AI try-on</Link>
          </div>
          <div className="fashion-hero__meta">
            <span>UPTHINK / IUH</span><span>SAIGON — 2026</span><span>SYS_02 // ONLINE</span>
          </div>
        </div>
        <div className="fashion-hero__art">
          <img src={HERO} alt="Streetwear fashion editorial" fetchPriority="high" />
          <div className="fashion-hero__overlay" />
          <span className="fashion-hero__label">LOOK / 001</span>
          <span className="fashion-hero__vertical">VIRTUAL FIT / PERSONAL EDIT</span>
        </div>
      </header>

      <main>
        <section className="fashion-intro-section">
          <div className="fashion-section-number">02</div>
          <div>
            <p className="fashion-eyebrow">From browsing to fitting</p>
            <h2 className="fashion-section-title">Không chỉ chọn đồ.<br /><i>Chọn cách bạn xuất hiện.</i></h2>
          </div>
          <p className="fashion-intro-copy">
            Fashion Dream giữ AI try-on làm core. Commerce được thiết kế lại để sản phẩm, outfit và AI stylist nối liền thành một hành trình mua sắm tự nhiên.
          </p>
        </section>

        <section className="fashion-ai-feature">
          <div className="fashion-ai-feature__visual">
            <img src="https://images.pexels.com/photos/17037339/pexels-photo-17037339.jpeg?auto=compress&cs=tinysrgb&w=1100" alt="AI outfit concept" loading="lazy" />
            <span>AI STUDIO / 01</span>
          </div>
          <div className="fashion-ai-feature__copy">
            <p className="fashion-eyebrow">Personal styling system</p>
            <h2 className="fashion-section-title">Your look,<br /><i>your logic.</i></h2>
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
            <div><p className="fashion-eyebrow">03 / THE COLLECTION</p><h2 className="fashion-section-title">New<br /><i>drop.</i></h2></div>
            <Link to="/shop" className="fashion-text-link">View all products ↗</Link>
          </div>
          <div className="fashion-product-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        <section className="fashion-flow">
          <div><p className="fashion-eyebrow">04 / THE EXPERIENCE</p><h2 className="fashion-section-title">See it.<br /><i>Try it.</i><br />Wear it.</h2></div>
          <div className="fashion-flow__steps">
            <div><span>01</span><h3>Discover</h3><p>Browse curated products and collections.</p></div>
            <div><span>02</span><h3>Try</h3><p>Upload your photo and visualize the fit with AI.</p></div>
            <div><span>03</span><h3>Style</h3><p>Build a complete look with AI recommendations.</p></div>
            <div><span>04</span><h3>Shop</h3><p>Add the pieces you love and check out.</p></div>
          </div>
        </section>

        <section className="fashion-editorial">
          <img src="https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="UpThink streetwear editorial" loading="lazy" />
          <div><p className="fashion-eyebrow">EDITORIAL / SAIGON</p><h2>Street is<br /><i>the studio.</i></h2><Link to="/about" className="fashion-btn fashion-btn--light">Our story ↗</Link></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
