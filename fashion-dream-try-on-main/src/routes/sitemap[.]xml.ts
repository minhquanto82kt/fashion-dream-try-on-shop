import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/seo";

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
        const products = await supabaseRequest<SitemapProduct[]>(
          "products?active=eq.true&status=eq.published&select=id&order=id.asc",
        );

        const staticUrls = ["/", "/shop", "/ai", "/about"];
        const productUrls = products.map((product) => `/product/${encodeURIComponent(product.id)}`);
        const urls = [...staticUrls, ...productUrls];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`).join("\n")}
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
