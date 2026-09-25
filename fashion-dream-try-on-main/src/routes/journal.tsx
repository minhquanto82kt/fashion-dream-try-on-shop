import { createFileRoute, Link } from "@tanstack/react-router";
import "@/styles/journal.css";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "WEARO Journal — Coming Soon" },
      { name: "description", content: "WEARO Journal — phong cách, cảm hứng và xu hướng thời trang. Coming Soon." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <main className="wearo-journal-page">
      <section className="wearo-journal-hero">
        <span className="wearo-journal-kicker">WEARO / JOURNAL</span>
        <div className="wearo-journal-status">COMING SOON</div>
        <h1>Phong cách, cảm hứng & xu hướng</h1>
        <p>WEARO Journal đang được chuẩn bị. Những câu chuyện về thời trang, cách phối đồ và phong cách sống hiện đại sẽ sớm được cập nhật.</p>
        <Link to="/shop">Khám phá cửa hàng →</Link>
      </section>
    </main>
  );
}
