import { createServerFn } from "@tanstack/react-start";
import { supabaseRequest } from "./supabase.server";

export type JournalStatus = "draft" | "published" | "scheduled";

export type JournalArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  seo_title: string;
  seo_description: string;
  status: JournalStatus;
  scheduled_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type AdminContext = { accessToken: string };

function getServerConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Thiếu cấu hình Supabase trên server.");
  return { url, secretKey };
}

async function requireAdmin(accessToken: string) {
  const token = accessToken.trim();
  if (!token) throw new Error("UNAUTHORIZED");

  const { url, secretKey } = getServerConfig();
  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: secretKey, Authorization: `Bearer ${token}` },
  });
  if (!userResponse.ok) throw new Error("UNAUTHORIZED");

  const user = (await userResponse.json()) as { id?: string };
  if (!user.id) throw new Error("UNAUTHORIZED");

  const admins = await supabaseRequest<Array<{ user_id: string }>>(
    `admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
    { method: "GET" },
  );
  if (!admins.length) throw new Error("FORBIDDEN");

  return user.id;
}

function normalizeArticleInput(input: Partial<JournalArticle> & { title: string; slug: string }) {
  const title = input.title.trim();
  const slug = input.slug.trim().toLowerCase();
  const category = (input.category ?? "STYLE GUIDE").trim() || "STYLE GUIDE";
  const excerpt = (input.excerpt ?? "").trim();
  const content = (input.content ?? "").trim();
  const seoTitle = (input.seo_title ?? title).trim();
  const seoDescription = (input.seo_description ?? excerpt).trim();
  const imageUrl = input.image_url?.trim() || null;
  const status = input.status ?? "draft";
  const scheduledAt = input.scheduled_at || null;

  if (!title) throw new Error("Tiêu đề bài viết là bắt buộc.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug chỉ được dùng chữ thường, số và dấu gạch ngang.");
  }
  if (!content) throw new Error("Nội dung bài viết không được để trống.");
  if (!seoTitle) throw new Error("SEO title không được để trống.");
  if (!seoDescription) throw new Error("SEO description không được để trống.");
  if (!["draft", "published", "scheduled"].includes(status)) {
    throw new Error("Trạng thái bài viết không hợp lệ.");
  }

  if (status === "scheduled") {
    if (!scheduledAt) throw new Error("Bài đặt lịch phải có thời gian đăng.");
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      throw new Error("Thời gian đăng phải ở tương lai.");
    }
  }

  return {
    title,
    slug,
    category,
    excerpt,
    content,
    image_url: imageUrl,
    seo_title: seoTitle,
    seo_description: seoDescription,
    status,
    scheduled_at: status === "scheduled" ? scheduledAt : null,
    published_at: status === "published" ? (input.published_at || new Date().toISOString()) : null,
  };
}

export const listPublishedJournalArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    const now = new Date().toISOString();
    const [published, scheduled] = await Promise.all([
      supabaseRequest<JournalArticle[]>(
        "journal_articles?select=*&status=eq.published&order=published_at.desc",
        { method: "GET" },
      ),
      supabaseRequest<JournalArticle[]>(
        `journal_articles?select=*&status=eq.scheduled&scheduled_at=lte.${encodeURIComponent(now)}&order=scheduled_at.desc`,
        { method: "GET" },
      ),
    ]);

    return [...published, ...scheduled].sort((a, b) => {
      const aDate = a.published_at ?? a.scheduled_at ?? a.created_at;
      const bDate = b.published_at ?? b.scheduled_at ?? b.created_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  },
);

export const getPublishedJournalArticle = createServerFn({ method: "POST" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    const rows = await supabaseRequest<JournalArticle[]>(
      `journal_articles?select=*&slug=eq.${encodeURIComponent(data.slug)}&limit=1`,
      { method: "GET" },
    );
    const article = rows[0];
    if (!article) return null;
    const visible =
      article.status === "published" ||
      (article.status === "scheduled" && Boolean(article.scheduled_at) && article.scheduled_at! <= now);
    return visible ? article : null;
  });

export const listAdminJournalArticles = createServerFn({ method: "POST" })
  .validator((data: AdminContext) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    return supabaseRequest<JournalArticle[]>(
      "journal_articles?select=*&order=created_at.desc",
      { method: "GET" },
    );
  });

export const getAdminJournalArticle = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const rows = await supabaseRequest<JournalArticle[]>(
      `journal_articles?select=*&id=eq.${encodeURIComponent(data.id)}&limit=1`,
      { method: "GET" },
    );
    return rows[0] ?? null;
  });

export const createAdminJournalArticle = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { article: { title: string; slug: string; category?: string; excerpt?: string; content: string; image_url?: string | null; seo_title?: string; seo_description?: string; status?: JournalStatus; scheduled_at?: string | null } }) => data)
  .handler(async ({ data }) => {
    const userId = await requireAdmin(data.accessToken);
    const article = normalizeArticleInput(data.article);

    const rows = await supabaseRequest<JournalArticle[]>("journal_articles", {
      method: "POST",
      body: JSON.stringify({ ...article, created_by: userId }),
    });
    return rows[0];
  });

export const updateAdminJournalArticle = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { id: string; article: Partial<JournalArticle> & { title: string; slug: string; content: string } }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const currentRows = await supabaseRequest<JournalArticle[]>(
      `journal_articles?select=*&id=eq.${encodeURIComponent(data.id)}&limit=1`,
      { method: "GET" },
    );
    if (!currentRows[0]) throw new Error("Không tìm thấy bài viết.");

    const current = currentRows[0];
    const article = normalizeArticleInput({
      ...current,
      ...data.article,
      published_at: data.article.status === "published" ? (current.published_at || undefined) : null,
    });

    const rows = await supabaseRequest<JournalArticle[]>(
      `journal_articles?id=eq.${encodeURIComponent(data.id)}`,
      { method: "PATCH", body: JSON.stringify(article) },
    );
    return rows[0];
  });

export const deleteAdminJournalArticle = createServerFn({ method: "POST" })
  .validator((data: AdminContext & { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    await supabaseRequest<unknown>(
      `journal_articles?id=eq.${encodeURIComponent(data.id)}`,
      { method: "DELETE" },
    );
    return { ok: true };
  });
