# WEARO Architecture

Tài liệu kiến trúc hiện tại của ứng dụng.

## Nguyên tắc

- GitHub là source of truth của source code.
- Supabase là source of truth cho dữ liệu ứng dụng.
- API/server xử lý các tác vụ cần secret hoặc quyền server.
- Client không chứa secret key.
- Khi thay đổi kiến trúc, cập nhật tài liệu này theo trạng thái code thực tế.
