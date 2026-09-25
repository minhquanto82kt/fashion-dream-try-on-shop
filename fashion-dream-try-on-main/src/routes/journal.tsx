import { createFileRoute, Link } from "@tanstack/react-router";
import "@/styles/journal.css";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "WEARO Journal — Phong cách & cảm hứng" },
      { name: "description", content: "WEARO Journal — phong cách, cảm hứng và xu hướng thời trang." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <main className="wearo-journal-page">
      <section className="wearo-journal-hero">
        <span>WEARO / JOURNAL</span>
        <h1>Phong cách, cảm hứng & xu hướng</h1>
        <p>Khám phá những câu chuyện về thời trang, cách phối đồ và phong cách sống hiện đại cùng WEARO.</p>
        <Link to="/shop">Khám phá cửa hàng →</Link>
      </section>
    </main>
  );
}
