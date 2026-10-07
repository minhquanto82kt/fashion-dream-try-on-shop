import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSession } from "@/lib/upthink-supabase";
import {
  createAdminJournalArticle,
  getAdminJournalArticle,
  updateAdminJournalArticle,
  type JournalStatus,
} from "@/lib/journal.functions";
import { analyzeJournalMarkdown, JournalMarkdown } from "@/lib/journal-markdown";
import "@/styles/journal-admin.css";

export const Route = createFileRoute("/admin/journal/$id")({
  component: JournalEditorPage,
  head: () => ({ meta: [{ title: "Journal Editor — WEARO" }] }),
});

type FormState = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  status: JournalStatus;
  scheduled_at: string;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  category: "STYLE GUIDE",
  excerpt: "",
  content: "",
  image_url: "",
  seo_title: "",
  seo_description: "",
  status: "draft",
  scheduled_at: "",
};

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function JournalEditorPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [contentMode, setContentMode] = useState<"editor" | "preview">("editor");
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    void (async () => {
      try {
        const accessToken = getSession()?.access_token;
        if (!accessToken) throw new Error("Phiên admin đã hết hạn. Vui lòng đăng nhập lại.");
        const article = await getAdminJournalArticle({ data: { accessToken, id } });
        if (!article) throw new Error("Không tìm thấy bài viết.");
        if (cancelled) return;
        setForm({
          title: article.title,
          slug: article.slug,
          category: article.category,
          excerpt: article.excerpt,
          content: article.content,
          image_url: article.image_url ?? "",
          seo_title: article.seo_title,
          seo_description: article.seo_description,
          status: article.status,
          scheduled_at: toLocalDateTime(article.scheduled_at),
        });
        setSlugEdited(true);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải bài viết.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isNew]);

  const wordCount = useMemo(() => form.content.trim() ? form.content.trim().split(/\s+/).length : 0, [form.content]);
  const paragraphCount = useMemo(
    () => form.content.trim() ? form.content.trim().split(/\n\s*\n/).filter(Boolean).length : 0,
    [form.content],
  );
  const seoTitleLength = form.seo_title.length;
  const seoDescriptionLength = form.seo_description.length;
  const markdownAnalysis = useMemo(() => analyzeJournalMarkdown(form.content), [form.content]);
  const h2OrH3Count = markdownAnalysis.headings.filter((heading) => heading.level >= 2).length;
  const internalLinkCount = markdownAnalysis.links.filter((link) => link.href.startsWith("/")).length;
  const imagesWithoutAlt = markdownAnalysis.images.filter((image) => !image.alt).length;

  const seoChecks = useMemo(() => {
    const normalizedTitleWords = form.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .split(/\s+/)
      .map((word) => word.replace(/[^a-z0-9]/g, ""))
      .filter((word) => word.length >= 4)
      .slice(0, 3);

    const normalizedSeoTitle = form.seo_title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

    const keywordCoverage = normalizedTitleWords.length > 0 &&
      normalizedTitleWords.filter((word) => normalizedSeoTitle.includes(word)).length >= Math.min(2, normalizedTitleWords.length);

    return [
      {
        key: "seo-title-length",
        label: "SEO title 30–60 ký tự",
        detail: `${seoTitleLength}/60 ký tự`,
        good: seoTitleLength >= 30 && seoTitleLength <= 60,
      },
      {
        key: "seo-title-relevance",
        label: "SEO title bám theo tiêu đề bài",
        detail: keywordCoverage ? "Có từ khóa chính" : "Nên đưa từ khóa chính vào",
        good: keywordCoverage,
      },
      {
        key: "seo-description-length",
        label: "SEO description 70–160 ký tự",
        detail: `${seoDescriptionLength}/160 ký tự`,
        good: seoDescriptionLength >= 70 && seoDescriptionLength <= 160,
      },
      {
        key: "slug",
        label: "Slug thân thiện",
        detail: form.slug ? `/${form.slug}` : "Chưa có slug",
        good: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug) && form.slug.length >= 3 && form.slug.length <= 75,
      },
      {
        key: "content-depth",
        label: "Nội dung đủ chiều sâu",
        detail: `${wordCount} từ · ${paragraphCount} đoạn`,
        good: wordCount >= 600 && paragraphCount >= 3,
      },
      {
        key: "excerpt",
        label: "Có excerpt mô tả rõ chủ đề",
        detail: `${form.excerpt.length} ký tự`,
        good: form.excerpt.trim().length >= 80,
      },
      {
        key: "image",
        label: "Có thumbnail / ảnh đại diện",
        detail: form.image_url ? "Đã thêm ảnh" : "Chưa có ảnh",
        good: Boolean(form.image_url.trim()),
      },
      {
        key: "headings",
        label: "Có H2/H3 để chia cấu trúc bài",
        detail: `${h2OrH3Count} heading trong nội dung`,
        good: h2OrH3Count >= 1,
      },
      {
        key: "internal-links",
        label: "Có internal link",
        detail: `${internalLinkCount} liên kết nội bộ`,
        good: internalLinkCount >= 1,
      },
      {
        key: "image-alt",
        label: "Ảnh trong nội dung có alt text",
        detail: markdownAnalysis.images.length ? `${imagesWithoutAlt} ảnh thiếu alt` : "Chưa có ảnh trong nội dung",
        good: markdownAnalysis.images.length > 0 && imagesWithoutAlt === 0,
      },
    ];
  }, [form.content, form.excerpt, form.image_url, form.seo_description, form.seo_title, form.slug, form.title, h2OrH3Count, imagesWithoutAlt, internalLinkCount, markdownAnalysis.images.length, paragraphCount, seoDescriptionLength, seoTitleLength, wordCount]);

  const seoScore = useMemo(
    () => Math.round((seoChecks.filter((check) => check.good).length / seoChecks.length) * 100),
    [seoChecks],
  );

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugEdited ? current.slug : slugify(value),
      seo_title: current.seo_title ? current.seo_title : value,
    }));
  }

  function insertMarkdown(before: string, after = "", placeholder = "nội dung") {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.slice(start, end) || placeholder;
    const replacement = `${before}${selected}${after}`;
    const nextContent = form.content.slice(0, start) + replacement + form.content.slice(end);
    setField("content", nextContent);
    requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = start + before.length;
      textarea.setSelectionRange(selectionStart, selectionStart + selected.length);
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const accessToken = getSession()?.access_token;
      if (!accessToken) throw new Error("Phiên admin đã hết hạn. Vui lòng đăng nhập lại.");

      const payload = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        image_url: form.image_url || null,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        status: form.status,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      };

      if (isNew) {
        const article = await createAdminJournalArticle({ data: { accessToken, article: payload } });
        setMessage("Đã tạo bài viết.");
        await navigate({ to: "/admin/journal/$id", params: { id: article.id } });
      } else {
        await updateAdminJournalArticle({ data: { accessToken, id, article: payload } });
        setMessage("Đã lưu bài viết.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu bài viết.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="up-admin-loading">Đang tải bài viết…</div>;

  return (
    <div className="wearo-journal-admin">
      <header className="up-admin-topbar">
        <div>
          <div className="up-admin-kicker">CONTENT / SEO CMS</div>
          <h1>{isNew ? "Bài viết mới" : "Chỉnh sửa Journal"}</h1>
          <p>Tạo nội dung, tối ưu SEO và kiểm soát trạng thái xuất bản.</p>
        </div>
        <Link className="up-admin-secondary-link" to="/admin/journal">← JOURNAL</Link>
      </header>

      {error && <div className="wearo-journal-form-error">{error}</div>}

      <div className="wearo-journal-editor">
        <section className="wearo-journal-editor-main">
          <label>TIÊU ĐỀ
            <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Ví dụ: AI thay đổi cách chọn size quần áo như thế nào?" />
          </label>

          <label>SLUG
            <input value={form.slug} onChange={(e) => { setSlugEdited(true); setField("slug", e.target.value); }} placeholder="ai-thay-doi-cach-chon-size-quan-ao" />
          </label>

          <div className="wearo-journal-form-two">
            <label>DANH MỤC
              <input value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="FASHION TECH" />
            </label>
            <label>THUMBNAIL URL
              <input value={form.image_url} onChange={(e) => setField("image_url", e.target.value)} placeholder="https://..." />
            </label>
          </div>

          <label>EXCERPT / MÔ TẢ NGẮN
            <textarea rows={4} value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} placeholder="Mô tả ngắn dùng cho card Journal và chia sẻ nội dung." />
          </label>

          <div className="wearo-journal-content-block">
            <div className="wearo-journal-content-head">
              <label>NỘI DUNG BÀI VIẾT</label>
              <div className="wearo-journal-content-mode">
                <button type="button" className={contentMode === "editor" ? "is-active" : ""} onClick={() => setContentMode("editor")}>EDITOR</button>
                <button type="button" className={contentMode === "preview" ? "is-active" : ""} onClick={() => setContentMode("preview")}>PREVIEW</button>
              </div>
            </div>

            {contentMode === "editor" ? (
              <>
                <div className="wearo-journal-markdown-toolbar" aria-label="Định dạng Markdown">
                  <button type="button" onClick={() => insertMarkdown("## ", "", "Tiêu đề phụ")}>H2</button>
                  <button type="button" onClick={() => insertMarkdown("### ", "", "Tiêu đề nhỏ")}>H3</button>
                  <button type="button" onClick={() => insertMarkdown("**", "**", "chữ đậm")}>B</button>
                  <button type="button" onClick={() => insertMarkdown("*", "*", "chữ nghiêng")}>I</button>
                  <button type="button" onClick={() => insertMarkdown("[", "](https://example.com)", "văn bản liên kết")}>LINK</button>
                  <button type="button" onClick={() => insertMarkdown("![", "](https://example.com/image.jpg)", "mô tả ảnh")}>IMAGE</button>
                  <button type="button" onClick={() => insertMarkdown("- ", "", "mục danh sách")}>LIST</button>
                  <button type="button" onClick={() => insertMarkdown("> ", "", "trích dẫn")}>QUOTE</button>
                </div>
                <textarea
                  ref={contentRef}
                  className="wearo-journal-content-editor"
                  rows={22}
                  value={form.content}
                  onChange={(e) => setField("content", e.target.value)}
                  placeholder={"## Tiêu đề phụ\n\nViết đoạn văn ở đây.\n\n### Tiêu đề nhỏ\n\n[Liên kết nội bộ](/journal)\n\n![Mô tả ảnh](https://...)\n\nNgăn cách các đoạn bằng một dòng trống."}
                />
              </>
            ) : (
              <JournalMarkdown className="wearo-journal-admin-preview" content={form.content || "Chưa có nội dung để xem trước."} />
            )}

            <div className="wearo-journal-editor-foot">
              <span>{wordCount} từ · {markdownAnalysis.headings.length} heading · {markdownAnalysis.links.length} link · {markdownAnalysis.images.length} ảnh</span>
              <span>Markdown an toàn · Không cho phép HTML tùy ý</span>
            </div>
          </div>
        </section>

        <aside className="wearo-journal-editor-side">
          <div className="wearo-journal-editor-card">
            <h2>XUẤT BẢN</h2>
            <label>TRẠNG THÁI
              <select value={form.status} onChange={(e) => setField("status", e.target.value as JournalStatus)}>
                <option value="draft">Đăng nháp</option>
                <option value="published">Đã đăng</option>
                <option value="scheduled">Đã đặt lịch đăng</option>
              </select>
            </label>

            {form.status === "scheduled" && (
              <label>THỜI GIAN ĐĂNG
                <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setField("scheduled_at", e.target.value)} />
              </label>
            )}

            <button className="up-admin-primary wearo-journal-save" type="button" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "ĐANG LƯU…" : isNew ? "TẠO BÀI VIẾT" : "LƯU THAY ĐỔI"}
            </button>
          </div>

          <div className="wearo-journal-editor-card">
            <div className="wearo-journal-seo-heading">
              <h2>SEO CHECKER</h2>
              <strong className={seoScore >= 80 ? "good" : seoScore >= 60 ? "warn" : "bad"}>{seoScore}/100</strong>
            </div>
            <p className="wearo-journal-seo-note">Bộ kiểm tra nội bộ của WEARO. Điểm này là checklist biên tập, không phải điểm xếp hạng của Google.</p>

            <label>SEO TITLE <span>{seoTitleLength}/60</span>
              <input value={form.seo_title} onChange={(e) => setField("seo_title", e.target.value)} maxLength={70} placeholder="Tiêu đề hiển thị trên Google" />
            </label>
            <label>SEO DESCRIPTION <span>{seoDescriptionLength}/160</span>
              <textarea rows={6} value={form.seo_description} onChange={(e) => setField("seo_description", e.target.value)} maxLength={180} placeholder="Mô tả hiển thị trên Google." />
            </label>

            <div className="wearo-journal-seo-checklist">
              {seoChecks.map((check) => (
                <div key={check.key} className={`wearo-journal-seo-check ${check.good ? "good" : "bad"}`}>
                  <span aria-hidden="true">{check.good ? "✓" : "!"}</span>
                  <div>
                    <strong>{check.label}</strong>
                    <small>{check.detail}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="wearo-journal-seo-meter">
              {seoScore >= 80 ? "SEO FOUNDATION TỐT" : seoScore >= 60 ? "SEO FOUNDATION CẦN BỔ SUNG" : "SEO FOUNDATION CẦN TỐI ƯU"}
            </div>
          </div>

          <div className="wearo-journal-editor-card">
            <h2>THUMBNAIL</h2>
            <div className="wearo-journal-preview-image">
              {form.image_url ? <img src={form.image_url} alt="" /> : <span>CHƯA CÓ ẢNH</span>}
            </div>
            <p>Hiện tại dùng URL ảnh để giữ MVP nhẹ. Có thể nối Supabase Storage upload ở bước tiếp theo.</p>
          </div>
        </aside>
      </div>

      {message && <div className="up-admin-toast">{message}</div>}
    </div>
  );
}
