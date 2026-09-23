import { getCustomerSession } from "@/lib/auth";
import { supabaseConfig } from "@/lib/upthink-supabase";

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  status: "published" | "hidden";
  created_at: string;
  updated_at: string;
};

const headers = (accessToken?: string) => ({
  apikey: supabaseConfig.key,
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${path}`, init);
  if (!response.ok) throw new Error(`Review request failed (${response.status})`);
  return (await response.json()) as T;
}

export async function listProductReviews(productId: string) {
  return request<ProductReview[]>(
    `product_reviews?product_id=eq.${encodeURIComponent(productId)}&status=eq.published&select=id,product_id,user_id,rating,title,body,status,created_at,updated_at&order=created_at.desc`,
    { headers: headers() },
  );
}

export async function createProductReview(input: { productId: string; rating: number; title?: string; body: string }) {
  const session = getCustomerSession();
  if (!session?.access_token || !session.user?.id) throw new Error("Vui lòng đăng nhập để đánh giá sản phẩm.");
  const rows = await request<ProductReview[]>("product_reviews", {
    method: "POST",
    headers: { ...headers(session.access_token), "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ product_id: input.productId, user_id: session.user.id, rating: input.rating, title: input.title?.trim() || null, body: input.body.trim() }),
  });
  return rows[0] ?? null;
}

export async function updateProductReview(reviewId: string, input: { rating: number; title?: string; body: string }) {
  const session = getCustomerSession();
  if (!session?.access_token) throw new Error("Vui lòng đăng nhập để chỉnh sửa đánh giá.");
  const rows = await request<ProductReview[]>(`product_reviews?id=eq.${encodeURIComponent(reviewId)}`, {
    method: "PATCH",
    headers: { ...headers(session.access_token), "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ rating: input.rating, title: input.title?.trim() || null, body: input.body.trim() }),
  });
  return rows[0] ?? null;
}

export async function deleteProductReview(reviewId: string) {
  const session = getCustomerSession();
  if (!session?.access_token) throw new Error("Vui lòng đăng nhập để xóa đánh giá.");
  await request<unknown[]>(`product_reviews?id=eq.${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
    headers: headers(session.access_token),
  });
}
