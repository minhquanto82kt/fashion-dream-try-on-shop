import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listPublishedJournalArticles, type JournalArticle } from "@/lib/journal.functions";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import "@/styles/journal.scss";

export const Route = createFileRoute("/journal")({
  loader: () => listPublishedJournalArticles(),
  head: () => ({
    meta: [
      { title: "WEARO Journal — Insights & Styles" },
      { name: "description", content: "WEARO Journal: thời trang Unisex, Streetwear, AI Fashion Tech, phối đồ và phong cách sống hiện đại." },
    ],
  }),
  component: JournalPage,
});

function formatDate(article: JournalArticle) {
  const value = article.published_at ?? article.scheduled_at ?? article.created_at;
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function readingTime(article: JournalArticle) {
  const words = article.content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 180))} phút đọc`;
}

function JournalPage() {
  const articles = Route.useLoaderData();
  const [category, setCategory] = useState("TẤT CẢ");
  const categories = useMemo(() => ["TẤT CẢ", ...Array.from(new Set(articles.map((article) => article.category)))], [articles]);
  const visibleArticles = category === "TẤT CẢ" ? articles : articles.filter((article) => article.category === category);

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
              <span className="wearo-journal-count">{articles.length} STORIES</span>
            </div>
            <div className="wearo-journal-filters" aria-label="Danh mục Journal">
              {categories.map((item) => (
                <button key={item} type="button" className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="wearo-journal-grid-section">
          <div className="wearo-journal-container">
            {visibleArticles.length ? (
              <div className="wearo-journal-grid">
                {visibleArticles.map((article) => (
                  <article key={article.id} className="wearo-journal-card">
                    <Link to="/journal/$slug" params={{ slug: article.slug }} className="wearo-journal-card-image">
                      {article.image_url ? <img src={article.image_url} alt={article.title} loading="lazy" /> : <div className="wearo-journal-card-image-fallback">WEARO / JOURNAL</div>}
                    </Link>
                    <div className="wearo-journal-card-copy">
                      <div className="wearo-journal-card-meta">
                        <span>{article.category}</span>
                        <time>{formatDate(article)}</time>
                      </div>
                      <h2><Link to="/journal/$slug" params={{ slug: article.slug }}>{article.title}</Link></h2>
                      <p>{article.excerpt}</p>
                      <div className="wearo-journal-card-bottom">
                        <span>{readingTime(article)}</span>
                        <Link to="/journal/$slug" params={{ slug: article.slug }} className="wearo-journal-read">ĐỌC BÀI →</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="wearo-journal-empty">Chưa có bài viết trong danh mục này.</div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
