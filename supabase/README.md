# Supabase SQL

This directory keeps the database structure and SQL changes for Fashion Dream Try-On Shop under Git version control.

## Current database

Supabase project ref: `oazipcrbutizdncctkcg`

The production database already has its own migration history. The files in `supabase/schema/` are reconstructed schema references and are **not** production migrations.

## Structure

```text
supabase/
├── schema/
│   ├── 001_core_products.sql
│   ├── 002_inventory_variants.sql
│   ├── 003_orders.sql
│   ├── 004_payments.sql
│   ├── 005_admin_auth.sql
│   ├── 006_ai_try_on.sql
│   ├── 007_product_vision.sql
│   └── 008_backend_functions.sql
├── migrations/
└── seed/
    └── 001_development.sql
```

## Architecture coverage

| Area | Git SQL reference | Live database checked |
|---|---|---|
| Products | `001_core_products.sql` | Yes |
| Inventory / Variants | `002_inventory_variants.sql` | Yes |
| Orders / Order Items | `003_orders.sql` | Yes |
| Payments / Payment Events | `004_payments.sql` | Yes |
| Admin authorization | `005_admin_auth.sql` | Yes |
| AI Try-On Jobs | `006_ai_try_on.sql` | Yes |
| Product Vision | `007_product_vision.sql` | Yes |
| SQL functions / triggers | `008_backend_functions.sql` | Yes |
| Development seed | `seed/001_development.sql` | Template only |

## Important distinction: schema snapshot vs migration

These files document the current architecture so the database design is visible in GitHub. They do **not** replace the 25 production migrations already present in Supabase.

Do not execute the schema files blindly against the existing production project. When the project is ready to make the Git repository fully replayable, reconcile the existing production migration history first and then generate a clean migration baseline.

## Rules

1. Supabase remains the source of truth for live data.
2. Do not copy production customer, order, payment, or authentication data into GitHub.
3. Never commit Supabase service-role keys, JWT secrets, API keys, or passwords.
4. Do not run schema snapshots directly against production without first verifying migration state.
5. New database changes should eventually be added as ordered migrations after the existing production migration history has been reconciled.
6. RLS policies, constraints, triggers, and functions are part of the database architecture and must be version-controlled as well.
7. Inventory source of truth is `product_variants.stock`; a separate inventory table is intentionally not introduced for the MVP.
8. Orders and payments are historical financial records and should not be hard-deleted as part of normal admin CRUD.
9. AI provider secrets remain server-side; `try_on_jobs` stores job state and storage paths, not provider secrets.

## Existing production migration history

The current Supabase project contains migrations covering:

- Product CMS foundation and security hardening
- Product variants and order-item linkage
- Atomic order creation
- Admin/RLS hardening
- Payment creation and verification
- SePay webhook/idempotency handling
- Product catalog seed
- Product image storage
- Admin user linkage
- Private Try-On storage and `try_on_jobs`
- Product Vision attributes

The live SQL layer also includes the atomic order/payment functions and payment synchronization/audit triggers. Their production migration history remains authoritative until a complete baseline is generated.
