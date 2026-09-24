# AI Try-On Rules

Luồng chuẩn:

Upload/Input → Server → AI Provider → Result → Storage → UI

## Nguyên tắc

- API secret nằm phía server.
- Đánh giá provider theo compatibility với Vercel, API stability, latency, cost, image quality, timeout, error handling và storage.
- Không tích hợp provider chỉ dựa trên chất lượng model; phải phù hợp MVP và architecture hiện tại.
