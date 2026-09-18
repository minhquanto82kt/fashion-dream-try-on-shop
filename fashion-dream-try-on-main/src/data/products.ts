/** @deprecated Product runtime data lives in Supabase + Product Domain.
 * Keep this file as a compatibility barrel while consumers migrate.
 */
export {
  CATEGORIES,
  formatVnd,
  type Product,
  type ProductCategory,
} from "@/lib/product-domain";
