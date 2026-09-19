# WEARO CRUD Matrix

| Entity | Create | Read | Update | Delete | Notes |
|---|---|---|---|---|---|
| Product | Admin | Storefront/Admin | Admin | Admin* | Prefer soft-delete/archive if referenced by orders |
| Variant | Admin | Storefront/Admin | Admin | Admin* | Preserve references from order items |
| Inventory | System/Admin | Admin/Storefront | System/Admin | No hard delete | Stock history must remain auditable |
| Cart | Customer | Customer | Customer | Customer | Session/user scoped |
| Order | Customer/System | Customer/Admin | System/Admin | No hard delete | Preserve transaction history |
| Order Item | System | Customer/Admin | No/limited | No hard delete | Snapshot purchased item data |
| Payment | System | Customer/Admin | Verification flow | No hard delete | Never mark paid from QR page view |
| Admin access | Admin | Auth/Admin | Admin | Admin | Protected by Auth + RLS + `is_admin()` |

`*` Delete behavior must be checked against foreign-key dependencies and business history before implementation.

For every data change, verify: UI -> request -> server/API -> Supabase query -> Auth/RLS -> constraint -> response -> UI refresh.
