# Supabase Database Layer

This directory keeps the database structure, database contracts, development seed data, and migration guidance for Fashion Dream Try-On Shop under Git version control.

## Current database

Supabase project ref: `oazipcrbutizdncctkcg`

The live production database remains the source of truth for current data and production migration history. The files in `supabase/schema/` are reconstructed schema references and are **not production migrations**.

## Structure

```text
supabase/
├── README.md
├── contracts/
│   └── data-model.md
├── migrations/
│   └── README.md
├── schema/
│   ├── README.md
│   ├── 001_core_products.sql
│   ├── 002_inventory_variants.sql
│   ├── 003_orders.sql
│   ├── 004_payments.sql
│   ├── 005_admin_auth.sql
│   ├── 006_ai_try_on.sql
│   ├── 007_product_vision.sql
│   ├── 008_backend_functions.sql
│   └── 009_site_branding.sql
└── seed/
    ├── README.md
    └── 001_development.sql
```

## Architecture coverage

| Area | Git SQL reference | Live database checked |
|---|---|---|
| Products | `schema/001_core_products.sql` | Yes |
| Inventory / Variants | `schema/002_inventory_variants.sql` | Yes |
| Orders / Order Items | `schema/003_orders.sql` | Yes |
| Payments / Payment Events | `schema/004_payments.sql` | Yes |
| Admin authorization | `schema/005_admin_auth.sql` | Yes |
| AI Try-On Jobs | `schema/006_ai_try_on.sql` | Yes |
| Product Vision | `schema/007_product_vision.sql` | Yes |
| SQL functions / triggers | `schema/008_backend_functions.sql` | Yes |
| Site branding / logo storage | `schema/009_site_branding.sql` | Yes |
| Development seed | `seed/001_development.sql` | Template only |

## Source-of-truth model

There are three different database artifacts and they must not be confused:

1. **Live Supabase database** — source of truth for production data and current production migration history.
2. **`schema/`** — human-readable architecture snapshots reconstructed from the live database. They describe tables, constraints, RLS, indexes, functions, and triggers but are not safe to replay blindly.
3. **`migrations/`** — reserved for an ordered, replayable migration history after the existing production migration history has been reconciled. It is intentionally not populated with a fake baseline today.

The database contract in `contracts/data-model.md` defines the intended relationships, ownership, CRUD boundaries, and invariants shared by frontend, API, AI, and database work.

## Important distinction: schema snapshot vs migration

These files document the current architecture so the database design is visible in GitHub. They do **not** replace the existing production migrations already present in Supabase.

Do not execute the schema files blindly against the existing production project. Before creating a replayable migration baseline, reconcile the existing production migration history and verify the resulting schema, RLS, grants, functions, triggers, indexes, and storage policies.

## Rules

1. Supabase remains the source of truth for live data.
2. Do not copy production customer, order, payment, or authentication data into GitHub.
3. Never commit Supabase service-role keys, JWT secrets, API keys, or passwords.
4. Do not run schema snapshots directly against production without first verifying migration state.
5. New database changes should eventually be added as ordered migrations after the existing production migration history has been reconciled.
6. RLS policies, grants, constraints, indexes, triggers, functions, and storage policies are part of the database architecture and must be version-controlled.
7. Inventory source of truth is `product_variants.stock`; a separate inventory table is intentionally not introduced for the MVP.
8. Orders and payments are historical financial records and should not be hard-deleted as part of normal admin CRUD.
9. AI provider secrets remain server-side; `try_on_jobs` stores job state and storage paths, not provider secrets.
10. Every database change must be checked against the database contract before changing application code.
11. Prefer additive, backward-compatible changes; avoid destructive DDL until dependent application code and data have been audited.
12. Any production schema change must be verified in a non-production environment before deployment.

## CRUD ownership

- **Products / variants / product images:** admin CRUD through authenticated server/database boundaries; public users have published-catalog read access only.
- **Orders:** customer creation goes through the existing atomic order RPC; admin users can read/update operational status. Do not hard-delete historical orders.
- **Payments:** payment creation/verification is controlled by server/database functions; admin users can read/update where explicitly allowed. Do not hard-delete payment history.
- **Payment events:** append-only audit history; application code should not rewrite or delete historical events.
- **Try-on jobs:** users create/read/update their own jobs according to RLS; provider credentials remain server-side.
- **Admin membership:** managed through privileged workflows; clients do not directly maintain `admin_users` membership.
- **Site branding:** public read, admin-only update/storage mutation.

## Existing production migration history

The current Supabase project contains production migrations covering product CMS/security, variants and order-item linkage, atomic order creation, admin/RLS hardening, payment creation/verification, SePay webhook/idempotency handling, catalog seed data, product image storage, admin linkage, private Try-On storage/jobs, Product Vision attributes, and related backend functions.

The production migration history remains authoritative until a complete baseline is generated and verified.
