import { createFileRoute, Link } from "@tanstack/react-router";
import { getPublishedJournalArticle } from "@/lib/journal.functions";
import { absoluteUrl, canonicalLink, jsonLdScript } from "@/lib/seo";
import { JournalMarkdown } from "@/lib/journal-markdown";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import "@/styles/journal.scss";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => getPublishedJournalArticle({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const article = loaderData;
    if (!article) {
      return { meta: [{ title: "Không tìm thấy bài viết — WEARO Journal" }] };
    }
    return {
      meta: [
        { title: article.seo_title },
        { name: "description", content: article.seo_description },
        { property: "og:title", content: article.seo_title },
        { property: "og:description", content: article.seo_description },
        { property: "og:url", content: absoluteUrl(`/journal/${article.slug}`) },
        ...(article.image_url ? [{ property: "og:image", content: article.image_url }] : []),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.seo_title },
        { name: "twitter:description", content: article.seo_description },
      ],
      links: [canonicalLink(`/journal/${article.slug}`)],
      scripts: [
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.seo_description,
          url: absoluteUrl(`/journal/${article.slug}`),
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": absoluteUrl(`/journal/${article.slug}`),
          },
          image: article.image_url ? [absoluteUrl(article.image_url)] : undefined,
          datePublished: article.published_at ?? article.scheduled_at ?? article.created_at,
          dateModified: article.updated_at,
          author: { "@type": "Organization", name: "WEARO", url: absoluteUrl("/") },
          publisher: { "@type": "Organization", name: "WEARO", url: absoluteUrl("/") },
          articleSection: article.category,
        }),
      ],
    };
  },
  component: JournalArticlePage,
});

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 180))} phút đọc`;
}

function JournalArticlePage() {
  const article = Route.useLoaderData();

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
            <div className="wearo-journal-article-meta"><time>{formatDate(article.published_at ?? article.scheduled_at ?? article.created_at)}</time><span>{readingTime(article.content)}</span></div>
          </header>
          <figure className="wearo-journal-article-hero">
            {article.image_url ? <img src={article.image_url} alt={article.title} /> : <div className="wearo-journal-card-image-fallback">WEARO / JOURNAL</div>}
          </figure>
          <JournalMarkdown className="wearo-journal-article-body" content={article.content} />
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
