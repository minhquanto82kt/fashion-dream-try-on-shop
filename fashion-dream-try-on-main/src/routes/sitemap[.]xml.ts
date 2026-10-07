import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/seo";
import { listPublishedJournalArticles } from "@/lib/journal.functions";

type SitemapUrl = {
  path: string;
  lastmod?: string | null;
};

type SitemapProduct = {
  id: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseRequest } = await import("@/lib/supabase.server");
        const [products, articles] = await Promise.all([
          supabaseRequest<SitemapProduct[]>(
            "products?active=eq.true&status=eq.published&select=id&order=id.asc",
          ),
          listPublishedJournalArticles(),
        ]);

        const staticUrls: SitemapUrl[] = [
          { path: "/" },
          { path: "/shop" },
          { path: "/ai" },
          { path: "/about" },
          { path: "/journal" },
        ];
        const productUrls: SitemapUrl[] = products.map((product) => ({
          path: `/product/${encodeURIComponent(product.id)}`,
        }));
        const journalUrls: SitemapUrl[] = articles.map((article) => ({
          path: `/journal/${article.slug}`,
          lastmod: article.updated_at,
        }));
        const urls = [...staticUrls, ...productUrls, ...journalUrls];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => `  <url>
    <loc>${escapeXml(absoluteUrl(item.path))}</loc>
    ${item.lastmod ? `<lastmod>${new Date(item.lastmod).toISOString()}</lastmod>` : ""}
  </url>`).join("\n")}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
