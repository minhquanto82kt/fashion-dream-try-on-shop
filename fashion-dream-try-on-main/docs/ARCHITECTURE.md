# WEARO — Architecture & Ownership Map

> Bản đồ ngắn gọn để mọi thay đổi mới đi đúng layer và không phá các luồng đang chạy.

## Product boundary

```text
UPTHINK — internal control layer
    ├── Admin / CMS
    ├── Product management
    ├── Inventory
    ├── Orders / operational controls
    ├── Appearance / content controls
    └── AI configuration

WEARO — customer-facing brand
    ├── Storefront
    ├── Product discovery
    ├── Cart / checkout
    ├── AI Studio
    └── Virtual Try-On
```

UpThink và WEARO là quan hệ **operator → brand**.

## Runtime layers

```text
UI / Routes
    ↓
Components + Hooks
    ↓
Domain / lib functions
    ↓
Supabase client / server functions
    ↓
Supabase PostgreSQL + RLS
    ↓
Storage / external AI providers
```

Vercel là deployment/runtime layer; GitHub là source-of-truth của code.

## Data ownership

| Entity | Source of truth | Rule |
|---|---|---|
| Product | Supabase | Không hard-code production catalog vào UI |
| Inventory | Supabase | Admin-only mutations |
| Cart | Existing cart layer | Không tạo thêm cart schema tùy tiện |
| Order | Supabase | Không hard-delete lịch sử giao dịch |
| Payment | Supabase/payment provider | Chỉ cập nhật Paid sau verify |
| User/Auth | Supabase Auth | Authorization qua RLS/admin checks |
| Appearance | Supabase settings + WEARO tokens | Runtime và code defaults phải nhất quán |
| AI result | Server → provider → storage/UI | Secret chỉ ở server |

## Change rules

1. Trước khi sửa dữ liệu: xác định table, PK/FK, RLS, query và UI refresh.
2. Trước khi sửa UI: xác định page/component sở hữu behavior.
3. Không tạo component trùng chức năng.
4. Không đổi internal identifiers chỉ vì đổi public branding.
5. Không dùng CSS hotfix để giải quyết lỗi logic.
6. Thay đổi lớn phải có test/verification tương ứng.

## Known technical debt

- Nhiều CSS admin/header là override/hotfix; cần gom dần theo domain.
- README còn mô tả dự án cũ và cần cập nhật thành WEARO/UpThink.
- Branding constants còn phân tán; nên gom về một config duy nhất rồi migrate từng bước.
- Cần tăng coverage cho authorization/admin RPC và các route quan trọng.
