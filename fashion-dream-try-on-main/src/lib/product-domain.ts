/** Canonical storefront product contract.
 *
 * Production product records are owned by Supabase. This module contains only
 * the application contract and pure mapping/formatting helpers; it must not
 * contain a hard-coded product catalogue.
 */
import { formatPrice } from "@/lib/i18n";

export type ProductCategory =
  | "hoodies"
  | "tees"
  | "outerwear"
  | "accessories"
  | "cap"
  | "sunglass";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  gallery: string[];
  sizes: string[];
  colors: string[];
  badge?: string;
  description: string;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string | null;
  active: boolean;
  status: string;
  featured: boolean;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

export const CATEGORIES = [
  { slug: "hoodies", name: "Hoodies" },
  { slug: "tees", name: "Tees" },
  { slug: "outerwear", name: "Outerwear" },
  { slug: "accessories", name: "Accessories" },
  { slug: "cap", name: "Caps" },
  { slug: "sunglass", name: "Sunglasses" },
] as const;

export function mapProduct(
  row: ProductRow,
  variants: ProductVariantRow[],
  images: ProductImageRow[],
): Product {
  const productVariants = variants.filter((variant) => variant.product_id === row.id);
  const productImages = images
    .filter((image) => image.product_id === row.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const gallery = productImages.map((image) => image.image_url);
  const primaryImage =
    productImages.find((image) => image.is_primary)?.image_url ??
    gallery[0] ??
    row.image ??
    "";

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    image: primaryImage,
    gallery: gallery.length > 0 ? gallery : primaryImage ? [primaryImage] : [],
    sizes: Array.from(new Set(productVariants.map((variant) => variant.size))),
    colors: Array.from(new Set(productVariants.map((variant) => variant.color))),
    badge: row.featured ? "Featured" : undefined,
    description: row.description,
  };
}

export function formatVnd(value: number) {
  return formatPrice(value);
}
