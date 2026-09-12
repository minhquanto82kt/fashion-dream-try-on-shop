# Supabase SQL

This directory keeps the database structure and SQL changes for Fashion Dream Try-On Shop under Git version control.

## Current database

Supabase project ref: `oazipcrbutizdncctkcg`

The production database already has its own migration history. The files in `supabase/schema/` are reconstructed schema references and are **not** production migrations.

## Structure

```text
supabase/
├── schema/
│   └── 001_core_products.sql
├── migrations/
└── seed/
```

## Rules

1. Supabase remains the source of truth for live data.
2. Do not copy production customer, order, payment, or authentication data into GitHub.
3. Never commit Supabase service-role keys, JWT secrets, API keys, or passwords.
4. Do not run schema snapshots directly against production without first verifying migration state.
5. New database changes should eventually be added as ordered migrations after the existing production migration history has been reconciled.
6. RLS policies, constraints, triggers, and functions are part of the database architecture and must be version-controlled as well.

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

The exact existing migration SQL should be imported/reconstructed before this repository starts treating `supabase/migrations/` as the canonical replayable migration set.
