# Admin Runbook

Tài liệu vận hành khu vực admin.

## Admin Auth

- Kiểm tra authentication trước khi thực hiện thao tác quản trị.
- Không bypass authorization chỉ để làm UI chạy.

## Admin Data

- Kiểm tra table, column, primary key, foreign key và RLS trước khi sửa CRUD.
- Các thao tác nguy hiểm cần confirmation.
- Không xóa dữ liệu production nếu chưa xác nhận phạm vi.
