# CRUD Rules

Mọi tính năng dữ liệu cần xác định rõ:

- Entity/table liên quan.
- CREATE thực hiện ở đâu.
- READ lấy dữ liệu từ đâu.
- UPDATE dùng ID nào.
- DELETE là hard delete hay soft delete.
- User nào được phép thao tác.
- Supabase RLS có cho phép hay không.
- UI refresh/refetch sau thành công.
- Error handling khi thất bại.

## Debug flow

UI → Request → Server/API → Supabase Query → Auth/RLS → Database Constraint → Response → UI Refresh
