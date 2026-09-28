# WEARO / Fashion Dream Try-On Shop — Database Contract

This document is the shared contract for frontend, API/server functions, AI workflows, admin UI, and Supabase SQL. It describes the current intended boundaries from the version-controlled schema references. It is not a replacement for live Supabase migration history.

## 1. Core relationship map

```text
products
   │
   ├──< product_variants
   │
   ├──< product_images
   │
   └──1 product_vision_attributes

product_variants
   │
   └──< order_items >── orders ──1── payments ──< payment_events

auth.users
   │
   ├──< admin_users
   └──< try_on_jobs

site_branding ──> storage.objects (site-branding/logo)
```

## 2. Entity contract

| Entity | Primary key | Owner/source of truth | Public read | Normal write path | Delete policy |
|---|---|---|---|---|---|
| `products` | `id` text | Supabase | Published + active catalog | Admin/server boundary | Admin-controlled; avoid deleting referenced history |
| `product_variants` | `id` uuid | Supabase | Published/active catalog | Admin/server boundary | Admin-controlled; product cascade is schema-defined |
| `product_images` | `id` uuid | Supabase Storage + table metadata | Published/active catalog | Admin/server boundary | Admin-controlled |
| `product_vision_attributes` | `product_id` | AI/product-vision pipeline | Yes in current snapshot | Privileged AI/server path | Avoid casual deletion; regenerate instead |
| `orders` | `id` uuid | Supabase | No public table read | Atomic order RPC / admin update | No normal hard delete |
| `order_items` | `id` uuid | Supabase | No public table read | Atomic order RPC | Cascade with order by current schema |
| `payments` | `id` uuid | Supabase | No public table read | Payment/RPC/server boundary | No normal hard delete |
| `payment_events` | `id` uuid | Supabase | No | Payment trigger/provider path | Append-only audit history |
| `admin_users` | `user_id` uuid | Privileged admin workflow | No direct client policy | Privileged workflow | Managed carefully; auth user FK cascades |
| `try_on_jobs` | `id` uuid | Supabase job state | Own user only | Authenticated user + server provider | User-scoped; retain according to product policy |
| `site_branding` | `id` text | Supabase | Public read | Admin update | Keep singleton `global` record |

## 3. Product catalog invariants

- `products.slug` is unique.
- Product price is a non-negative integer and represents the application's smallest supported currency unit for the current MVP convention.
- `product_variants.stock` is the inventory source of truth; do not introduce a second inventory count without an explicit architecture decision.
- `(product_id, size, color)` is unique for variants.
- SKU is unique when present.
- Product images are ordered by `sort_order`.
- At most one product image is primary per product.
- Public catalog exposure must be restricted to the intended active/published visibility contract.

## 4. Order invariants

- `orders.order_code` is unique.
- `order_items.order_id` references `orders.id`.
- Order items preserve product name, size, color, quantity, and unit price as historical snapshots.
- Quantity must be greater than zero.
- Unit price, subtotal, shipping fee, and total cannot be negative.
- Customer order creation is controlled by the existing atomic order RPC rather than a public direct table insert.
- Order history is financial/business history and must not be hard-deleted as ordinary CRUD.

## 5. Payment invariants

```text
Order
  ↓
Payment(pending)
  ↓
Provider verification / server processing
  ↓
Payment(paid|failed|refunded)
  ↓
Payment event audit
  ↓
Order payment/order-status synchronization
```

- A payment belongs to exactly one order in the current schema (`unique(order_id)`).
- Provider transaction identifiers are indexed and provider transaction/event IDs are protected against duplicate processing where present.
- `payment_events` is an audit trail and should be append-only from application perspective.
- Opening a QR page or creating a pending payment must never by itself mark an order as paid.
- Payment verification must occur through the controlled server/database path documented in `schema/008_backend_functions.sql`.

## 6. Authorization contract

```text
Public/anon
  └── published catalog read only

Authenticated customer
  └── own try-on jobs

Authenticated admin
  ├── product CRUD
  ├── variant CRUD
  ├── product image CRUD
  ├── operational order read/update
  ├── payment read/update where policy allows
  └── site branding update/storage mutation

Privileged/server path
  ├── admin membership management
  ├── payment provider processing
  └── AI provider operations
```

RLS is the database authorization boundary. Client-side route guards are UX controls, not a substitute for RLS.

## 7. AI Try-On contract

`try_on_jobs` represents asynchronous job state, not provider credentials.

```text
Input image paths
   ↓
queued
   ↓
processing
   ├──> completed + result_image_path
   └──> failed + error
```

Provider secrets remain server-side. Storage paths are metadata and must not be treated as credentials.

## 8. Storage contract

The current site-branding snapshot defines a public `site-branding` bucket with a fixed `logo` object and admin-only mutation policies. Keep the binary asset in Storage and the active URL/reference in `site_branding`.

Try-On storage remains a separate concern and is documented by the production migration history; do not infer public access from the `try_on_jobs` table alone.

## 9. Known reconciliation items

These are intentionally documented instead of silently changing live-facing snapshots:

1. `schema/001_core_products.sql` currently describes product-variant public visibility as active **and published**, while the older `schema/002_inventory_variants.sql` snapshot uses active-only visibility. Reconcile this against the live RLS policy before generating a migration baseline.
2. `schema/007_product_vision.sql` contains a privileged `service_role` management policy expressed at the broad `public` target. Review least-privilege grants/policies during the migration-baseline audit rather than treating the snapshot as a new production migration.
3. `migrations/` is intentionally not a replayable production history yet. Do not manufacture a baseline by renaming schema snapshots.

## 10. Change protocol

For every database change:

1. Identify entity/table and current schema.
2. Identify CREATE/READ/UPDATE/DELETE owner.
3. Check primary/foreign keys and existing constraints.
4. Check RLS and grants.
5. Check dependent RPC/functions/triggers.
6. Check frontend/API callers.
7. Prefer additive migration-compatible changes.
8. Test on non-production.
9. Verify the live response and UI refresh behavior.
10. Only then promote to production and update the corresponding Git reference.
