# WEARO Data Architecture

## Source of truth

- Products: product catalog and product variants are the source of truth for storefront product data.
- Inventory: inventory records are authoritative for stock availability.
- Orders: orders are the immutable business record of a purchase lifecycle; do not hard-delete production orders.
- Order items: preserve the purchased product/variant snapshot associated with an order.
- Payments: payment records represent payment state and verification; opening a QR page is not payment confirmation.
- Auth/admin: Supabase Auth identifies users; `admin_users` and the `is_admin()` RPC determine administrative access.

## Runtime flow

`Storefront -> server/API -> Supabase -> PostgreSQL/RLS`

AI follows:

`Input -> server -> AI provider -> result -> storage -> UI`

## Integrity rules

- Database remains the source of truth for persistent commerce data.
- Use stable primary keys and explicit foreign keys.
- Do not expose service-role secrets to client code.
- Do not disable RLS to bypass an application error.
- Payment/order state must be verified server-side.
- Destructive production operations require an explicit, reviewed migration or administrative action.
