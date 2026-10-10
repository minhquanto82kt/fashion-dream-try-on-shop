import { useEffect, useState, type CSSProperties } from "react";

type StudioMode = "concept" | "tryon";

const palette = {
  blue: "#54728C",
  blueLight: "#7794A6",
  peach: "#F2CEAE",
  sand: "#D9BBA9",
  coral: "#F2AD94",
  ink: "#20272D",
  muted: "#66727C",
  paper: "#F8F7F4",
  white: "#FFFFFF",
  line: "rgba(84, 114, 140, .20)",
};

const styles = ["Minimal", "Smart casual", "Street", "Y2K"];
const occasions = ["Đi học", "Đi làm", "Đi chơi", "Hẹn hò"];
const demoProducts = [
  { id: "top-01", name: "Áo thun form rộng", category: "Áo", color: "Xanh slate", price: "320.000 ₫", swatch: palette.blue },
  { id: "shirt-02", name: "Sơ mi relaxed", category: "Áo", color: "Kem ấm", price: "450.000 ₫", swatch: palette.peach },
  { id: "pants-03", name: "Quần suông tối giản", category: "Quần", color: "Nâu cát", price: "520.000 ₫", swatch: palette.sand },
];

const buttonStyle: CSSProperties = {
  border: `1px solid ${palette.blue}`,
  background: palette.blue,
  color: palette.white,
  padding: "12px 16px",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const cardStyle: CSSProperties = {
  border: `1px solid ${palette.line}`,
  background: palette.white,
  minWidth: 0,
};

function FieldLabel({ children }: { children: string }) {
  return (
    <span style={{ display: "block", marginBottom: 9, color: palette.blue, fontSize: 10, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

export default function AiLabPage() {
  const [mode, setMode] = useState<StudioMode>("concept");
  const [style, setStyle] = useState("Minimal");
  const [occasion, setOccasion] = useState("Đi chơi");
  const [brief, setBrief] = useState("");
  const [productId, setProductId] = useState(demoProducts[0].id);
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState("");
  const [concept, setConcept] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!personFile) {
      setPersonPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(personFile);
    setPersonPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [personFile]);

  const selectedProduct = demoProducts.find((product) => product.id === productId) ?? demoProducts[0];

  function handleGenerateConcept() {
    const detail = brief.trim()
      ? `Ưu tiên theo yêu cầu: “${brief.trim()}”.`
      : "Ưu tiên phom thoải mái, màu sắc dễ phối và tính ứng dụng hằng ngày.";
    setConcept(
      `Gợi ý outfit WEARO\n\n• Phong cách: ${style}\n• Dịp sử dụng: ${occasion}\n• Item chủ đạo: ${selectedProduct.name} màu ${selectedProduct.color.toLowerCase()}\n• Cách phối: kết hợp cùng quần suông trung tính, sneaker sạch và một phụ kiện nhỏ để tổng thể có điểm nhấn.\n\n${detail}\n\nĐây là nội dung minh họa giao diện trong Lab, chưa phải phản hồi từ mô hình AI.`,
    );
    setNotice("Đã tạo bản xem trước concept mẫu. Lab chưa gọi API AI.");
  }

  function handleFileChange(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice("Vui lòng chọn ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setNotice("Ảnh vượt quá 6 MB. Hãy chọn ảnh nhẹ hơn.");
      return;
    }
    setPersonFile(file);
    setNotice("Ảnh đã được tải vào bản xem trước trên trình duyệt; chưa gửi lên máy chủ.");
  }

  const chip = (active: boolean): CSSProperties => ({
    border: `1px solid ${active ? palette.blue : palette.line}`,
    background: active ? palette.blue : palette.white,
    color: active ? palette.white : palette.ink,
    padding: "9px 12px",
    fontSize: 12,
    cursor: "pointer",
  });

  return (
    <main style={{ minHeight: "100vh", background: palette.paper, color: palette.ink, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", padding: "clamp(18px, 4vw, 56px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderBottom: `1px solid ${palette.line}`, paddingBottom: 20 }}>
          <div>
            <p style={{ margin: 0, color: palette.blue, fontSize: 10, fontWeight: 800, letterSpacing: ".2em" }}>WEARO / EXPERIMENTAL LAB</p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: palette.muted }}>AI Studio · Concept & Virtual Try-On</p>
          </div>
          <span style={{ border: `1px solid ${palette.line}`, background: palette.white, padding: "7px 10px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", color: palette.blue }}>PROTOTYPE ONLY</span>
        </div>

        <header style={{ padding: "clamp(28px, 5vw, 58px) 0 30px", maxWidth: 760 }}>
          <p style={{ margin: "0 0 12px", color: palette.blue, fontSize: 11, fontWeight: 800, letterSpacing: ".16em" }}>STYLE IS PERSONAL</p>
          <h1 style={{ margin: 0, fontSize: "clamp(34px, 6vw, 64px)", lineHeight: 1.02, letterSpacing: "-.055em", fontWeight: 600 }}>
            Mặc theo cách <span style={{ color: palette.blue }}>của bạn.</span>
          </h1>
          <p style={{ maxWidth: 630, color: palette.muted, fontSize: 15, lineHeight: 1.8, margin: "20px 0 0" }}>
            Khám phá concept outfit hoặc chuẩn bị ảnh cho trải nghiệm thử đồ ảo. Chọn phong cách, dịp sử dụng và sản phẩm để bắt đầu.
          </p>
        </header>

        <div role="tablist" aria-label="Chế độ AI Studio" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          <button type="button" role="tab" aria-selected={mode === "concept"} onClick={() => setMode("concept")} style={chip(mode === "concept")}>01 / Tạo concept</button>
          <button type="button" role="tab" aria-selected={mode === "tryon"} onClick={() => setMode("tryon")} style={chip(mode === "tryon")}>02 / Virtual Try-On</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 18, alignItems: "start" }}>
          <section style={cardStyle} aria-label="Thiết lập yêu cầu">
            <div style={{ padding: "17px 20px", borderBottom: `1px solid ${palette.line}`, display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong style={{ fontSize: 12, letterSpacing: ".08em" }}>{mode === "concept" ? "THIẾT LẬP CONCEPT" : "CHUẨN BỊ THỬ ĐỒ"}</strong>
              <span style={{ color: palette.muted, fontSize: 10 }}>INPUT / 01</span>
            </div>
            <div style={{ padding: 20 }}>
              <FieldLabel>Phong cách</FieldLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {styles.map((item) => <button key={item} type="button" aria-pressed={style === item} onClick={() => setStyle(item)} style={chip(style === item)}>{item}</button>)}
              </div>

              <div style={{ marginTop: 24 }}>
                <FieldLabel>Dịp sử dụng</FieldLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {occasions.map((item) => <button key={item} type="button" aria-pressed={occasion === item} onClick={() => setOccasion(item)} style={chip(occasion === item)}>{item}</button>)}
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <label htmlFor="lab-product" style={{ display: "block" }}><FieldLabel>Sản phẩm tham chiếu</FieldLabel></label>
                <select id="lab-product" value={productId} onChange={(event) => setProductId(event.target.value)} style={{ boxSizing: "border-box", width: "100%", padding: 12, border: `1px solid ${palette.line}`, background: palette.white, color: palette.ink, fontSize: 13 }}>
                  {demoProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.color}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 13, marginTop: 10, background: palette.paper, border: `1px solid ${palette.line}` }}>
                  <span aria-hidden="true" style={{ width: 38, height: 48, flexShrink: 0, background: selectedProduct.swatch, border: "1px solid rgba(0,0,0,.08)" }} />
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 12 }}>{selectedProduct.name}</strong>
                    <span style={{ display: "block", color: palette.muted, fontSize: 11, marginTop: 4 }}>{selectedProduct.category} · {selectedProduct.color}</span>
                    <span style={{ display: "block", color: palette.blue, fontSize: 11, fontWeight: 700, marginTop: 5 }}>{selectedProduct.price}</span>
                  </div>
                </div>
              </div>

              {mode === "concept" ? (
                <div style={{ marginTop: 24 }}>
                  <label htmlFor="lab-brief"><FieldLabel>Mô tả mong muốn · không bắt buộc</FieldLabel></label>
                  <textarea id="lab-brief" value={brief} onChange={(event) => setBrief(event.target.value)} maxLength={400} rows={4} placeholder="Ví dụ: tông trung tính, form rộng, dễ mặc cả ngày…" style={{ boxSizing: "border-box", width: "100%", resize: "vertical", padding: 12, border: `1px solid ${palette.line}`, background: palette.white, color: palette.ink, font: "inherit", fontSize: 13, lineHeight: 1.7 }} />
                  <p style={{ textAlign: "right", color: palette.muted, fontSize: 10, margin: "6px 0 0" }}>{brief.length}/400</p>
                  <button type="button" onClick={handleGenerateConcept} style={{ ...buttonStyle, width: "100%", marginTop: 12 }}>Tạo bản xem trước ↗</button>
                </div>
              ) : (
                <div style={{ marginTop: 24 }}>
                  <FieldLabel>Ảnh của bạn</FieldLabel>
                  <label htmlFor="lab-person-image" style={{ minHeight: 190, padding: 14, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, border: `1px dashed ${palette.blueLight}`, background: palette.paper, cursor: "pointer", textAlign: "center" }}>
                    {personPreview ? <img src={personPreview} alt="Ảnh đã chọn để xem trước" style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain" }} /> : <><span aria-hidden="true" style={{ fontSize: 28, color: palette.blue }}>＋</span><strong style={{ fontSize: 12 }}>Chọn ảnh toàn thân hoặc ảnh rõ dáng</strong><span style={{ fontSize: 11, color: palette.muted }}>JPG, PNG hoặc WEBP · tối đa 6 MB</span></>}
                    <input id="lab-person-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleFileChange(event.target.files?.[0])} style={{ maxWidth: "100%", fontSize: 11 }} />
                  </label>
                  <label htmlFor="lab-tryon-note" style={{ display: "block", marginTop: 20 }}><FieldLabel>Ghi chú phối đồ</FieldLabel></label>
                  <textarea id="lab-tryon-note" value={brief} onChange={(event) => setBrief(event.target.value)} maxLength={400} rows={3} placeholder="Ví dụ: giữ nền ảnh, phối tự nhiên…" style={{ boxSizing: "border-box", width: "100%", resize: "vertical", padding: 12, border: `1px solid ${palette.line}`, background: palette.white, color: palette.ink, font: "inherit", fontSize: 13, lineHeight: 1.7 }} />
                  <button type="button" onClick={() => setNotice(personFile ? "Ảnh đã sẵn sàng cho bước tích hợp AI. Chức năng tạo ảnh chưa được kết nối trong Lab." : "Hãy chọn ảnh trước khi tiếp tục.")} style={{ ...buttonStyle, width: "100%", marginTop: 12 }}>Kiểm tra dữ liệu đầu vào ↗</button>
                  <p style={{ color: palette.muted, fontSize: 11, lineHeight: 1.6, margin: "10px 0 0" }}>Ảnh chỉ được xem trước trong trình duyệt ở prototype này; chưa tải lên server hoặc gửi đến nhà cung cấp AI.</p>
                </div>
              )}
            </div>
          </section>

          <section style={{ ...cardStyle, background: "#F1EEE8" }} aria-live="polite">
            <div style={{ padding: "17px 20px", borderBottom: `1px solid ${palette.line}`, display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong style={{ fontSize: 12, letterSpacing: ".08em" }}>{mode === "concept" ? "KẾT QUẢ CONCEPT" : "KHUNG KẾT QUẢ TRY-ON"}</strong>
              <span style={{ color: palette.muted, fontSize: 10 }}>OUTPUT / 02</span>
            </div>
            <div style={{ padding: 20 }}>
              {mode === "concept" && concept ? (
                <div style={{ background: palette.white, border: `1px solid ${palette.line}`, padding: "clamp(18px, 3vw, 28px)" }}>
                  <p style={{ margin: "0 0 14px", color: palette.blue, fontSize: 10, fontWeight: 800, letterSpacing: ".16em" }}>WEARO STYLE NOTE / DEMO</p>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.9 }}>{concept}</p>
                  <button type="button" onClick={() => { void navigator.clipboard?.writeText(concept); setNotice("Đã gửi yêu cầu sao chép concept."); }} style={{ ...buttonStyle, marginTop: 20, background: "transparent", color: palette.blue }}>Sao chép concept</button>
                </div>
              ) : mode === "tryon" && personPreview ? (
                <div style={{ minHeight: 330, background: palette.white, border: `1px solid ${palette.line}`, padding: 12, textAlign: "center" }}>
                  <img src={personPreview} alt="Ảnh người dùng xem trước, chưa qua AI" style={{ maxWidth: "100%", maxHeight: 420, objectFit: "contain" }} />
                  <p style={{ color: palette.muted, fontSize: 11, lineHeight: 1.6 }}>Ảnh đầu vào · chưa phải ảnh thử đồ do AI tạo</p>
                  <div style={{ textAlign: "left", background: palette.paper, padding: 12, fontSize: 12, lineHeight: 1.7 }}>
                    <strong>{selectedProduct.name}</strong><br />Phong cách {style} · {occasion}
                    {brief.trim() ? <><br />Ghi chú: {brief.trim()}</> : null}
                  </div>
                </div>
              ) : (
                <div style={{ minHeight: 330, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: 24, border: `1px dashed ${palette.line}`, background: "rgba(255,255,255,.55)" }}>
                  <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 58, height: 58, borderRadius: "50%", background: palette.peach, color: palette.blue, fontSize: 24 }}>✳</span>
                  <h2 style={{ fontSize: 19, fontWeight: 600, margin: "18px 0 8px" }}>{mode === "concept" ? "Phong cách bắt đầu từ bạn" : "Kết quả sẽ xuất hiện tại đây"}</h2>
                  <p style={{ maxWidth: 310, color: palette.muted, fontSize: 12, lineHeight: 1.8, margin: 0 }}>{mode === "concept" ? "Chọn phong cách và dịp sử dụng, sau đó tạo bản xem trước concept." : "Chọn ảnh để xem trước dữ liệu đầu vào. Pipeline tạo ảnh AI chưa được kết nối trong Lab."}</p>
                </div>
              )}

              <div style={{ marginTop: 16, padding: 14, background: "rgba(242,206,174,.28)", borderLeft: `3px solid ${palette.coral}` }}>
                <strong style={{ display: "block", fontSize: 11 }}>Lưu ý về prototype</strong>
                <p style={{ margin: "5px 0 0", color: palette.muted, fontSize: 11, lineHeight: 1.7 }}>Lab chỉ minh họa luồng giao diện. Dữ liệu sản phẩm ở đây là mẫu; chưa kết nối catalog, Supabase hoặc API AI production.</p>
              </div>
            </div>
          </section>
        </div>

        {notice ? <p role="status" style={{ margin: "16px 0 0", padding: "12px 14px", border: `1px solid ${palette.line}`, background: palette.white, color: palette.ink, fontSize: 12, lineHeight: 1.7 }}>{notice}</p> : null}

        <footer style={{ marginTop: 38, paddingTop: 18, borderTop: `1px solid ${palette.line}`, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: palette.muted, fontSize: 10, letterSpacing: ".08em" }}>
          <span>WEARO · STYLE, WITHOUT RULES</span>
          <span>LAB EXPERIMENT · NOT A PRODUCTION ROUTE</span>
        </footer>
      </div>
    </main>
  );
}
