import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { JOURNAL_ARTICLES } from "@/data/journal";
import "@/styles/journal.css";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "WEARO Journal — Insights & Styles" },
      { name: "description", content: "WEARO Journal: thời trang Unisex, Streetwear, AI Fashion Tech, phối đồ và phong cách sống hiện đại." },
    ],
  }),
  component: JournalPage,
});

const CATEGORIES = ["TẤT CẢ", ...Array.from(new Set(JOURNAL_ARTICLES.map((article) => article.category)))];

function JournalPage() {
  return (
    <div className="wearo-journal-shell">
      <SiteNav />
      <main className="wearo-journal-page">
        <section className="wearo-journal-header">
          <div className="wearo-journal-container">
            <span className="wearo-journal-kicker">INSIGHTS & STYLES</span>
            <div className="wearo-journal-header-row">
              <div>
                <h1>WEARO JOURNAL</h1>
                <p>Góc nhìn về thời trang Unisex, AI Fashion Tech, phối đồ và phong cách sống hiện đại.</p>
              </div>
              <span className="wearo-journal-count">{JOURNAL_ARTICLES.length} STORIES</span>
            </div>
            <div className="wearo-journal-filters" aria-label="Danh mục Journal">
              {CATEGORIES.map((category, index) => (
                <span key={category} className={index === 0 ? "is-active" : ""}>{category}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="wearo-journal-grid-section">
          <div className="wearo-journal-container">
            <div className="wearo-journal-grid">
              {JOURNAL_ARTICLES.map((article) => (
                <article key={article.slug} className="wearo-journal-card">
                  <Link to="/journal/$slug" params={{ slug: article.slug }} className="wearo-journal-card-image">
                    <img src={article.image} alt={article.title} loading="lazy" />
                  </Link>
                  <div className="wearo-journal-card-copy">
                    <div className="wearo-journal-card-meta">
                      <span>{article.category}</span>
                      <time>{article.date}</time>
                    </div>
                    <h2><Link to="/journal/$slug" params={{ slug: article.slug }}>{article.title}</Link></h2>
                    <p>{article.excerpt}</p>
                    <Link to="/journal/$slug" params={{ slug: article.slug }} className="wearo-journal-read">ĐỌC BÀI →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
