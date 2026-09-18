/**
 * CI-only Supabase REST fixture.
 *
 * This is deliberately tiny and independent from the storefront catalogue.
 * Production application data must come from Supabase, not from this file.
 */
export type SmokeProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "hoodies" | "tees" | "outerwear" | "accessories" | "cap" | "sunglass";
  image: string;
  active: boolean;
  status: string;
  featured: boolean;
};

export const SMOKE_PRODUCTS: SmokeProduct[] = [
  {
    id: "smoke-hoodie",
    name: "Smoke Hoodie",
    description: "CI smoke-test product.",
    price: 1290000,
    category: "hoodies",
    image: "https://example.com/smoke-hoodie.jpg",
    active: true,
    status: "published",
    featured: true,
  },
  {
    id: "smoke-tee",
    name: "Smoke Tee",
    description: "CI smoke-test product.",
    price: 690000,
    category: "tees",
    image: "https://example.com/smoke-tee.jpg",
    active: true,
    status: "published",
    featured: false,
  },
];

export const SMOKE_VARIANTS = SMOKE_PRODUCTS.flatMap((product) => [
  {
    id: `${product.id}-m-black`,
    product_id: product.id,
    size: "M",
    color: "Black",
    stock: 12,
  },
]);

export const SMOKE_IMAGES = SMOKE_PRODUCTS.map((product) => ({
  id: `${product.id}-image-1`,
  product_id: product.id,
  image_url: product.image,
  sort_order: 0,
  is_primary: true,
}));
