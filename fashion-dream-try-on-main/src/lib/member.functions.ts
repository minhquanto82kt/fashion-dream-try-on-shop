import { createServerFn } from "@tanstack/react-start";
import { supabaseUserRequest } from "@/lib/supabase-user.server";

type MemberInput = { accessToken: string };
type AuthUser = { id: string; email?: string };
type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
};
type UserVoucher = { id: string; voucher_id: string; status: "available" | "used" | "expired"; claimed_at: string; used_at: string | null };
type OrderRow = { id: string; payment_status: string; order_status: string };
type OrderItem = { product_id: string; product_name: string; quantity: number; unit_price: number };
type Product = { id: string; name: string; category: string; price: number; image: string | null; slug: string; active: boolean; status: string };

async function getMemberUser(accessToken: string): Promise<AuthUser> {
  const token = accessToken.trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Thiếu cấu hình Supabase trên server.");
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("UNAUTHORIZED");
  const user = (await response.json()) as AuthUser;
  if (!user?.id) throw new Error("UNAUTHORIZED");
  return user;
}

export const getMemberDashboard = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as MemberInput)
  .handler(async ({ data }) => {
    const user = await getMemberUser(data.accessToken);
    const [vouchers, claimed, orders] = await Promise.all([
      supabaseUserRequest<Voucher[]>("vouchers?select=*&order=created_at.desc", data.accessToken),
      supabaseUserRequest<UserVoucher[]>(`user_vouchers?user_id=eq.${encodeURIComponent(user.id)}&select=id,voucher_id,status,claimed_at,used_at&order=claimed_at.desc`, data.accessToken),
      supabaseUserRequest<OrderRow[]>(`orders?user_id=eq.${encodeURIComponent(user.id)}&select=id,payment_status,order_status&order=created_at.desc&limit=100`, data.accessToken),
    ]);

    const claimSet = new Set(claimed.map((item) => item.voucher_id));
    const unclaimedVouchers = vouchers.filter((voucher) => !claimSet.has(voucher.id));
    if (unclaimedVouchers.length) {
      try {
        await supabaseUserRequest<UserVoucher[]>("user_vouchers", data.accessToken, {
          method: "POST",
          body: JSON.stringify(unclaimedVouchers.map((voucher) => ({ user_id: user.id, voucher_id: voucher.id }))),
          headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
        });
      } catch {
        // Dashboard remains usable even if claiming is temporarily unavailable.
      }
    }

    const [freshClaimed, orderItems] = await Promise.all([
      supabaseUserRequest<UserVoucher[]>(`user_vouchers?user_id=eq.${encodeURIComponent(user.id)}&select=id,voucher_id,status,claimed_at,used_at&order=claimed_at.desc`, data.accessToken),
      orders.length
        ? supabaseUserRequest<OrderItem[]>(`order_items?order_id=in.(${orders.map((order) => order.id).join(",")})&select=product_id,product_name,quantity,unit_price&order=created_at.desc&limit=500`, data.accessToken)
        : Promise.resolve([] as OrderItem[]),
    ]);

    const purchasedIds = [...new Set(orderItems.map((item) => item.product_id).filter(Boolean))];
    const products = await supabaseUserRequest<Product[]>(
      "products?active=eq.true&status=eq.published&select=id,name,category,price,image,slug,active,status&order=featured.desc,created_at.desc&limit=100",
      data.accessToken,
    );

    const purchasedCategoryCounts = new Map<string, number>();
    for (const item of orderItems) {
      const product = products.find((candidate) => candidate.id === item.product_id);
      if (product?.category) purchasedCategoryCounts.set(product.category, (purchasedCategoryCounts.get(product.category) ?? 0) + item.quantity);
    }
    const preferredCategories = [...purchasedCategoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category);
    const recommendations = products
      .filter((product) => !purchasedIds.includes(product.id))
      .sort((a, b) => {
        const categoryA = preferredCategories.indexOf(a.category);
        const categoryB = preferredCategories.indexOf(b.category);
        const scoreA = categoryA === -1 ? 999 : categoryA;
        const scoreB = categoryB === -1 ? 999 : categoryB;
        if (scoreA !== scoreB) return scoreA - scoreB;
        return Number(b.price) - Number(a.price);
      })
      .slice(0, 6)
      .map((product) => ({
        ...product,
        reason: preferredCategories.includes(product.category)
          ? `Đề xuất vì bạn thường mua nhóm ${product.category}.`
          : "Gợi ý thêm từ catalog WEARO đang được xuất bản.",
      }));

    return {
      user,
      plan: "loyalty" as const,
      vouchers,
      claimedVouchers: freshClaimed,
      recommendations,
      purchaseStats: {
        orderCount: orders.length,
        paidOrderCount: orders.filter((order) => order.payment_status === "paid").length,
        purchasedItemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        preferredCategories,
      },
    };
  });
