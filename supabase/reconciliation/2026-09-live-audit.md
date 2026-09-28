# Supabase Live Database Reconciliation — 2026-09

Target project: `oazipcrbutizdncctkcg`
Branch: `feature/product-admin`

## Scope

This report was generated from a read-only inspection of the live Supabase database. No production DDL or data mutation was performed.

## 1. Migration history

The live project currently reports **71 migrations**. The previous repository documentation that described approximately 25 migrations is outdated.

The authoritative migration history currently spans:

- `20260909011420` → `20260928054350`
- first migration: `phase_1_product_cms_foundation`
- latest migration: `apply_member_voucher_to_order`

The complete ordered manifest is stored at `supabase/migrations/production-manifest.json`.

### Migration baseline status

**NOT YET REPLAYABLE FROM THIS REPOSITORY.**

The Supabase connector exposes the live migration versions/names, but not the complete SQL bodies of each historical migration. Therefore the repository must not fabricate a baseline by renaming the existing schema snapshots.

The correct next step is to export/retrieve the actual 71 migration SQL files from the Supabase project/CLI, commit them in exact order, and verify replay on a non-production database.

## 2. Live public tables

The live database contains **27 public base tables**.

### Already represented by the 9 repository schema snapshots

- `products`
- `product_variants`
- `product_images`
- `orders`
- `order_items`
- `payments`
- `payment_events`
- `admin_users`
- `try_on_jobs`
- `product_vision_attributes`
- `site_branding`

### Live tables missing from the repository schema snapshots

These 16 tables are present in production but were not represented by the previous 9-file schema snapshot set:

- `ai_usage_daily`
- `appearance_branding`
- `appearance_palettes`
- `appearance_themes`
- `cart_items`
- `carts`
- `inventory_movements`
- `product_reviews`
- `product_tags`
- `site_content_settings`
- `site_theme_settings`
- `tags`
- `user_roles`
- `user_vouchers`
- `vouchers`
- `wishlist_items`

This is the largest schema-documentation gap found by the audit.

## 3. RLS status

All 27 live public tables currently have Row Level Security enabled.

Policy counts observed:

| Table | RLS | Policies |
|---|---|---:|
| `admin_users` | enabled | 1 |
| `ai_usage_daily` | enabled | 1 |
| `appearance_branding` | enabled | 3 |
| `appearance_palettes` | enabled | 4 |
| `appearance_themes` | enabled | 4 |
| `cart_items` | enabled | 1 |
| `carts` | enabled | 1 |
| `inventory_movements` | enabled | 1 |
| `order_items` | enabled | 1 |
| `orders` | enabled | 2 |
| `payment_events` | enabled | 1 |
| `payments` | enabled | 2 |
| `product_images` | enabled | 4 |
| `product_reviews` | enabled | 4 |
| `product_tags` | enabled | 3 |
| `product_variants` | enabled | 4 |
| `product_vision_attributes` | enabled | 1 |
| `products` | enabled | 4 |
| `site_branding` | enabled | 2 |
| `site_content_settings` | enabled | 3 |
| `site_theme_settings` | enabled | 3 |
| `tags` | enabled | 4 |
| `try_on_jobs` | enabled | 1 |
| `user_roles` | enabled | 4 |
| `user_vouchers` | enabled | 3 |
| `vouchers` | enabled | 1 |
| `wishlist_items` | enabled | 3 |

## 4. Important live architecture discovered

The production database is broader than the original ecommerce + AI snapshot. It also contains:

- cart persistence: `carts`, `cart_items`
- inventory audit: `inventory_movements`
- reviews: `product_reviews`
- catalog taxonomy: `tags`, `product_tags`
- vouchers: `vouchers`, `user_vouchers`
- wishlist: `wishlist_items`
- RBAC: `user_roles`
- AI quota tracking: `ai_usage_daily`
- appearance/theme management: `appearance_branding`, `appearance_palettes`, `appearance_themes`
- editable site content: `site_content_settings`, `site_theme_settings`

These are not optional documentation extras; they are part of the live database contract and should be represented in Git before future schema changes are made.

## 5. Functions / RPC surface

The live database contains security-sensitive functions including:

- `create_order_atomic_v2`
- `create_payment_for_order`
- `verify_payment_status`
- `process_sepay_payment`
- `process_momo_payment`
- `find_sepay_payment`
- `apply_best_member_voucher`
- `publish_site_content`
- `discard_site_content_draft`
- `publish_appearance_theme`
- `consume_ai_quota`
- `record_ai_usage_result`
- `track_guest_order`
- `update_order_status_as_manager`
- `cancel_my_order`
- `has_backoffice_role`
- `is_admin`
- `is_admin_user`

Several are `SECURITY DEFINER`. Their execute grants and `search_path` hardening must remain part of the migration history; they must not be reconstructed from table snapshots alone.

## 6. Storage

The live project currently contains these buckets:

| Bucket | Public | Limit | MIME policy |
|---|---|---:|---|
| `ai-results` | no | 10 MB | JPEG/PNG/WebP |
| `email-assets` | yes | none reported | none reported |
| `product-images` | yes | 10 MB | JPEG/PNG/WebP/GIF |
| `site-branding` | yes | 2 MB | PNG/JPEG/WebP/SVG |
| `try-on-assets` | no | 10 MB | JPEG/PNG/WebP |

Storage policies are part of the live security boundary and therefore must be included when the migration history is reconciled.

## 7. Reconciliation findings

### R1 — Migration history drift

**Status: confirmed.**

Production has 71 migrations, while the repository previously described a much smaller history. The repository must treat the live migration list as authoritative until all migration SQL is exported.

### R2 — Schema snapshot incompleteness

**Status: confirmed.**

16 live tables are absent from the 9 schema snapshots.

### R3 — Product visibility contract

The live RLS policy for `products`, `product_images`, and `product_variants` uses both `active = true` and `status = 'published'`. This should be treated as the current live visibility contract.

### R4 — Inventory architecture is broader than `product_variants.stock`

`product_variants.stock` remains the current stock field, but the live database also contains `inventory_movements`. The repository documentation should therefore describe `product_variants.stock` as the current inventory balance and `inventory_movements` as the audit/history layer, rather than claiming that no inventory table exists.

### R5 — RBAC is broader than `admin_users`

The live database contains `user_roles`, `app_role`, and `has_backoffice_role(...)`. Admin-only checks therefore use both legacy/admin helpers and the newer backoffice role model. This must be documented before modifying authorization policies.

### R6 — Payment surface is broader than the original snapshot

The live RPC surface includes both SePay and MoMo processing, plus member voucher application. Payment/order migrations must not be recreated from the four-table snapshot alone.

## 8. Safe migration-baseline plan

Do **not** create a fake `000_baseline.sql` from `schema/*.sql`.

Required sequence:

1. Export the exact 71 production migration SQL files from Supabase.
2. Commit them unchanged under `supabase/migrations/` in timestamp order.
3. Keep `supabase/schema/` as human-readable snapshots.
4. Add the 16 missing live-table snapshots or a generated full schema snapshot.
5. Reconcile storage buckets/policies, functions, triggers, grants, enums, and indexes.
6. Apply the complete migration history to a disposable/non-production database.
7. Compare catalog + RLS + storage + RPC surface against production.
8. Only after parity is verified, use the migration directory as the repository source for future changes.

## Result

The audit did **not** find an RLS-disabled public table. It did find a significant repository-to-production documentation gap and confirmed that a real migration baseline must be built from the 71 historical migration files, not from the 9 reconstructed schema snapshots.
