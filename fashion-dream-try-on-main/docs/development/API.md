# API Rules

- API phải phù hợp với architecture hiện tại.
- Secret/API key chỉ được sử dụng phía server.
- Validate input trước khi ghi dữ liệu.
- Error response phải đủ thông tin để UI xử lý nhưng không làm lộ secret.
- Khi API thay đổi, kiểm tra toàn bộ client đang gọi endpoint đó.
