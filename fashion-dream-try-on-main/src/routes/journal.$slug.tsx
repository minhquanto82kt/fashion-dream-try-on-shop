import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getJournalArticle } from "@/data/journal";
import "@/styles/journal.css";

export const Route = createFileRoute("/journal/$slug")({
  head: ({ params }) => {
    const article = getJournalArticle(params.slug);
    return {
      meta: [
        { title: article?.seoTitle ?? "WEARO Journal" },
        { name: "description", content: article?.seoDescription ?? "WEARO Journal — Insights & Styles." },
      ],
    };
  },
  component: JournalArticlePage,
});

function JournalArticlePage() {
  const { slug } = Route.useParams();
  const article = getJournalArticle(slug);

  if (!article) {
    return (
      <div className="wearo-journal-shell">
        <SiteNav />
        <main className="wearo-journal-empty">
          <span className="wearo-journal-kicker">WEARO / JOURNAL</span>
          <h1>Không tìm thấy bài viết</h1>
          <Link to="/journal">← Về Journal</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="wearo-journal-shell">
      <SiteNav />
      <main className="wearo-journal-article">
        <div className="wearo-journal-container">
          <Link to="/journal" className="wearo-journal-back">← TẤT CẢ BÀI VIẾT</Link>
          <header className="wearo-journal-article-header">
            <span className="wearo-journal-kicker">{article.category}</span>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>
            <div className="wearo-journal-article-meta"><time>{article.date}</time><span>{article.readingTime}</span></div>
          </header>
          <figure className="wearo-journal-article-hero">
            <img src={article.image} alt={article.title} />
          </figure>
          <div className="wearo-journal-article-body">
            {article.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="wearo-journal-article-footer">
            <span>WEARO JOURNAL</span>
            <Link to="/journal">XEM THÊM BÀI VIẾT →</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
