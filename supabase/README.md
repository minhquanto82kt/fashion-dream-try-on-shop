# Supabase Database Layer

This directory keeps the database structure, database contracts, development seed data, read-only audit checks, live reconciliation records, and migration guidance for Fashion Dream Try-On Shop under Git version control.

## Current database

Supabase project ref: `oazipcrbutizdncctkcg`

The live production database remains the source of truth for current data and production migration history. The files in `supabase/schema/` are reconstructed schema references and are **not production migrations**.

## Structure

```text
supabase/
├── README.md
├── contracts/
│   └── data-model.md
├── checks/
│   ├── README.md
│   └── 001_security_integrity_audit.sql
├── reconciliation/
│   └── 2026-09-live-audit.md
├── migrations/
│   ├── README.md
│   └── production-manifest.json
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

## Live audit result — 2026-09-28

The live Supabase project contains:

- **71 production migrations** — exact versions/names are recorded in `migrations/production-manifest.json`.
- **27 public base tables** — all 27 have RLS enabled.
- **5 storage buckets** — including private AI/Try-On storage and public catalog/branding storage.
- A broader commerce/RBAC/content surface than the original 9 schema snapshots.

The original 9 schema files cover the core catalog, orders, payments, admin, AI Try-On, Product Vision, backend functions, and site branding. The live database also contains carts, inventory movements, reviews, tags, vouchers, wishlist, RBAC, AI quota tracking, and appearance/content workflows. See `reconciliation/2026-09-live-audit.md` and `contracts/data-model.md`.

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
| Live commerce extensions | `reconciliation/2026-09-live-audit.md` | Yes |
| Live RBAC / appearance / content | `reconciliation/2026-09-live-audit.md` | Yes |
| Development seed | `seed/001_development.sql` | Template only |
| Read-only DB audit | `checks/001_security_integrity_audit.sql` | Manual |

## Source-of-truth model

There are four different database artifacts and they must not be confused:

1. **Live Supabase database** — source of truth for production data and current production migration history.
2. **`schema/`** — human-readable architecture snapshots reconstructed from the live database. They describe selected tables, constraints, RLS, indexes, functions, and triggers but are not safe to replay blindly.
3. **`migrations/production-manifest.json`** — exact live migration versions/names captured from Supabase. It is a manifest, not the migration SQL bodies.
4. **`migrations/` SQL files** — reserved for the exact ordered production migration history. They must be populated from the real migration bodies, not manufactured from schema snapshots.

The database contract in `contracts/data-model.md` defines the live relationships, ownership, CRUD boundaries, and invariants shared by frontend, API, AI, and database work. The read-only checks in `checks/` provide a repeatable sanity audit without mutating the database.

## Important distinction: schema snapshot vs migration

These files document the current architecture so the database design is visible in GitHub. They do **not** replace the existing production migrations already present in Supabase.

Do not execute the schema files blindly against the existing production project. Before creating a replayable migration baseline, reconcile the existing production migration history and verify the resulting schema, RLS, grants, functions, triggers, indexes, enums, and storage policies.

## Rules

1. Supabase remains the source of truth for live data and current production migration history.
2. Do not copy production customer, order, payment, or authentication data into GitHub.
3. Never commit Supabase service-role keys, JWT secrets, API keys, or passwords.
4. Do not run schema snapshots directly against production without first verifying migration state.
5. New database changes should be added as ordered migrations once the real production migration bodies are available in Git.
6. RLS policies, grants, constraints, indexes, triggers, functions, enums, and storage policies are part of the database architecture and must be version-controlled.
7. `product_variants.stock` is the current inventory balance/source used by commerce logic; `inventory_movements` is the audit/history layer.
8. Orders and payments are historical financial records and should not be hard-deleted as part of normal admin CRUD.
9. AI provider secrets remain server-side; `try_on_jobs` stores job state and storage paths, not provider secrets.
10. Every database change must be checked against the database contract before changing application code.
11. Prefer additive, backward-compatible changes; avoid destructive DDL until dependent application code and data have been audited.
12. Any production schema change must be verified in a non-production environment before deployment.
13. Do not claim the repository has a replayable migration baseline until the exact historical SQL files have been committed and replay-tested.

## CRUD ownership

- **Products / variants / product images:** admin/backoffice CRUD through authenticated database boundaries; public users have published-catalog read access only.
- **Carts / wishlist / user vouchers:** authenticated users manage only their own records under RLS.
- **Orders:** customer creation goes through the existing atomic order RPC; backoffice users can read/update operational status according to role. Do not hard-delete historical orders.
- **Payments:** payment creation/verification is controlled by server/database functions; read/update access is role-scoped. Do not hard-delete payment history.
- **Payment events / inventory movements:** append-only audit/history layers.
- **Product reviews:** verified-buyer/customer and backoffice policies govern create/update/delete/read.
- **Tags / product tags / vouchers / appearance / site content:** backoffice workflows governed by live RLS and RPC permissions.
- **Try-on jobs / AI quota:** user/server workflow; provider credentials remain server-side.
- **Admin membership / user roles:** privileged or admin role-management workflows; clients do not directly elevate themselves.
- **Storage:** bucket-specific RLS policies govern public reads and admin/server mutations.

## Production migration status

The live Supabase project currently reports **71 migrations**. The exact ordered version/name list is captured in `migrations/production-manifest.json`.

The SQL bodies are not yet present in this repository, so the project is **not yet a replayable migration baseline**. The next safe step is to export/retrieve the exact 71 migration SQL files, commit them unchanged in timestamp order, replay them on a disposable/non-production database, and compare the resulting catalog/RLS/RPC/storage surface against production.

Until that parity test passes, `schema/` remains documentation/reference only and the live Supabase migration history remains authoritative.
