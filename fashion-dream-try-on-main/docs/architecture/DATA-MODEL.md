# WEARO Data Model

## Luồng dữ liệu thương mại điện tử

Products → Cart → Orders → Order Items → Payment

## Nguyên tắc

- Mỗi entity có một source of truth.
- ID ổn định được dùng để xác định record.
- Không hard-code dữ liệu động vào frontend.
- Order và Payment không hard-delete nếu việc xóa ảnh hưởng lịch sử giao dịch.
- Schema phải được kiểm tra trước khi thay đổi code sử dụng schema đó.
