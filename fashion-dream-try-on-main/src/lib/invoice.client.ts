import type { InvoiceData } from "./invoice.functions";

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfFromJpegPages(pages: Array<{ data: string; width: number; height: number }>) {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const imageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  let nextId = 3;

  for (const page of pages) {
    imageObjectIds.push(nextId++);
    contentObjectIds.push(nextId++);
    pageObjectIds.push(nextId++);
  }

  const pagesId = nextId++;
  const catalogId = nextId++;

  pages.forEach((page, index) => {
    const base64 = page.data.split(",")[1] ?? "";
    const binary = atob(base64);
    const stream = Array.from(binary, (char) => String.fromCharCode(char.charCodeAt(0))).join("");
    const imageId = imageObjectIds[index];
    const contentId = contentObjectIds[index];
    const pageId = pageObjectIds[index];

    objects[imageId] = `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    const content = `q\n595 0 0 842 0 0 cm\n/Im${index + 1} Do\nQ`;
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im${index + 1} ${imageId} 0 R >> >> >> /Contents ${contentId} 0 R >>`;
  });

  objects[pagesId] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[1] = "<< /Producer (WEARO) >>";
  objects[2] = "<< /Type /Metadata /Subtype /XML /Length 0 >>\nstream\n\nendstream";

  let pdf = "%PDF-1.4\n%\xFF\xFF\xFF\xFF\n";
  const offsets: number[] = [];
  for (let id = 1; id <= catalogId; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id] ?? "<<>>"}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${catalogId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= catalogId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${catalogId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}

function drawInvoicePage(invoice: InvoiceData, items: InvoiceData["items"], pageIndex: number, pageCount: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1190;
  canvas.height = 1684;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không thể tạo PDF hóa đơn.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111111";
  ctx.font = "700 42px Arial";
  ctx.fillText("WEARO", 80, 90);
  ctx.font = "700 30px Arial";
  ctx.fillText("HÓA ĐƠN ĐẶT HÀNG", 80, 155);
  ctx.font = "22px Arial";
  ctx.fillText(`Mã đơn hàng: ${invoice.order_code}`, 80, 205);
  ctx.fillText(`Ngày đặt: ${new Date(invoice.created_at).toLocaleString("vi-VN")}`, 80, 240);
  ctx.fillText(`Thanh toán: ${invoice.payment_method.toUpperCase()}`, 80, 275);
  ctx.fillText(`Trạng thái: ${invoice.payment_status === "paid" ? "ĐÃ THANH TOÁN" : "COD - THANH TOÁN KHI NHẬN HÀNG"}`, 80, 310);

  ctx.strokeStyle = "#dddddd";
  ctx.beginPath(); ctx.moveTo(80, 345); ctx.lineTo(1110, 345); ctx.stroke();

  ctx.font = "700 22px Arial";
  ctx.fillText("SẢN PHẨM", 80, 390);
  ctx.font = "700 19px Arial";
  ctx.fillText("Sản phẩm", 80, 430);
  ctx.fillText("SL", 780, 430);
  ctx.fillText("Đơn giá", 850, 430);
  ctx.fillText("Thành tiền", 990, 430);

  let y = 470;
  ctx.font = "19px Arial";
  for (const item of items) {
    const name = `${item.product_name} | ${item.size} | ${item.color}`;
    const maxChars = 52;
    const lines = name.length > maxChars ? [name.slice(0, maxChars), name.slice(maxChars)] : [name];
    lines.forEach((line, index) => ctx.fillText(line, 80, y + index * 25));
    ctx.fillText(String(item.quantity), 790, y);
    ctx.fillText(formatVnd(item.unit_price), 850, y);
    ctx.fillText(formatVnd(item.unit_price * item.quantity), 990, y);
    y += lines.length * 28 + 18;
  }

  const isLast = pageIndex === pageCount - 1;
  if (isLast) {
    ctx.strokeStyle = "#dddddd";
    ctx.beginPath(); ctx.moveTo(700, y + 5); ctx.lineTo(1110, y + 5); ctx.stroke();
    y += 50;
    ctx.font = "20px Arial";
    ctx.fillText(`Tạm tính: ${formatVnd(invoice.subtotal)}`, 760, y);
    y += 35;
    ctx.fillText(`Vận chuyển: ${formatVnd(invoice.shipping_fee)}`, 760, y);
    y += 45;
    ctx.font = "700 25px Arial";
    ctx.fillText(`TỔNG CỘNG: ${formatVnd(invoice.total)}`, 700, y);

    y += 80;
    ctx.font = "700 21px Arial";
    ctx.fillText("THÔNG TIN GIAO HÀNG", 80, y);
    ctx.font = "19px Arial";
    y += 38;
    ctx.fillText(`Khách hàng: ${invoice.customer_name}`, 80, y);
    y += 32;
    ctx.fillText(`Điện thoại: ${invoice.phone}`, 80, y);
    y += 32;
    ctx.fillText(`Địa chỉ: ${invoice.address}, ${invoice.district}, ${invoice.city}`, 80, y);
    if (invoice.email) { y += 32; ctx.fillText(`Email: ${invoice.email}`, 80, y); }
    y += 70;
    ctx.font = "italic 19px Arial";
    ctx.fillText("Cảm ơn bạn đã mua hàng tại WEARO - Mặc theo cách của riêng bạn.", 80, y);
  }

  ctx.font = "16px Arial";
  ctx.fillStyle = "#777777";
  ctx.fillText(`WEARO • Trang ${pageIndex + 1}/${pageCount}`, 80, 1625);

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function openInvoicePdf(invoice: InvoiceData) {
  const chunkSize = 10;
  const chunks: InvoiceData["items"][] = [];
  for (let i = 0; i < invoice.items.length; i += chunkSize) {
    chunks.push(invoice.items.slice(i, i + chunkSize));
  }
  if (!chunks.length) chunks.push([]);

  const pages = chunks.map((items, index) => ({
    data: drawInvoicePage(invoice, items, index, chunks.length),
    width: 1190,
    height: 1684,
  }));

  const blob = buildPdfFromJpegPages(pages);
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `WEARO-${invoice.order_code}.pdf`;
    anchor.click();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
