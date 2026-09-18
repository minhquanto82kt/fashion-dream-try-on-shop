import { createServerFn } from "@tanstack/react-start";
import {
  mapProduct,
  type Product,
  type ProductImageRow,
  type ProductRow,
  type ProductVariantRow,
} from "@/lib/product-domain";

async function loadPublishedProducts(limit?: number): Promise<Product[]> {
  const { supabaseRequest } = await import("@/lib/supabase.server");
  const limitQuery = limit && limit > 0 ? `&limit=${Math.min(limit, 100)}` : "";
  const [products, variants, images] = await Promise.all([
    supabaseRequest<ProductRow[]>(
      `products?active=eq.true&status=eq.published&select=id,name,description,price,category,image,active,status,featured&order=created_at.desc${limitQuery}`,
    ),
    supabaseRequest<ProductVariantRow[]>(
      "product_variants?select=id,product_id,size,color,stock&order=size.asc,color.asc",
    ),
    supabaseRequest<ProductImageRow[]>(
      "product_images?select=id,product_id,image_url,sort_order,is_primary&order=sort_order.asc",
    ),
  ]);

  return products.map((product) => mapProduct(product, variants, images));
}

export const listPublishedProducts = createServerFn({ method: "GET" }).handler(
  async () => loadPublishedProducts(),
);

export const listFeaturedProducts = createServerFn({ method: "GET" }).handler(
  async () => (await loadPublishedProducts(12)).filter((product) => product.badge),
);

export const getPublishedProduct = createServerFn({ method: "GET" })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    const { supabaseRequest } = await import("@/lib/supabase.server");
    const [products, variants, images] = await Promise.all([
      supabaseRequest<ProductRow[]>(
        `products?id=eq.${encodeURIComponent(productId)}&active=eq.true&status=eq.published&select=id,name,description,price,category,image,active,status,featured&limit=1`,
      ),
      supabaseRequest<ProductVariantRow[]>(
        `product_variants?product_id=eq.${encodeURIComponent(productId)}&select=id,product_id,size,color,stock&order=size.asc,color.asc`,
      ),
      supabaseRequest<ProductImageRow[]>(
        `product_images?product_id=eq.${encodeURIComponent(productId)}&select=id,product_id,image_url,sort_order,is_primary&order=sort_order.asc`,
      ),
    ]);

    const row = products[0];
    return row ? mapProduct(row, variants, images) : null;
  });
