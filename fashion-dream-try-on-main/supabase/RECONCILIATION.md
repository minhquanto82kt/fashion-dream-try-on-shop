# Supabase Database Reconciliation

> Generated from the live Supabase project `oazipcrbutizdncctkcg` and the `feature/product-admin` branch.
> This document is an inventory/reconciliation record. It is **not** a migration and must not be executed.

## Purpose

The live database contains migration history that is not currently represented by files under `supabase/migrations/` in GitHub. This document records the live migration ledger so the schema can be reconstructed into version-controlled SQL without guessing.

## Live migration ledger

| Version | Name |
|---|---|
| 20260909011420 | phase_1_product_cms_foundation |
| 20260909011432 | phase_1_product_cms_security_hardening |
| 20260910015650 | link_order_items_to_product_variants |
| 20260910020016 | create_order_atomic |
| 20260910020119 | restrict_create_order_atomic_execution |
| 20260910041936 | harden_rls_and_admin_access |
| 20260910042746 | phase_1_performance_and_function_hardening |
| 20260910042942 | create_payment_backend |
| 20260910043418 | complete_payment_verification_layer |
| 20260910044144 | add_sepay_payment_event_identity |
| 20260910044150 | add_provider_event_to_payment_audit |
| 20260910044156 | fix_payment_event_trigger_columns |
| 20260910044248 | harden_sepay_payment_event_validation |
| 20260910044622 | finalize_sepay_payment_flow |
| 20260910044646 | sepay_webhook_idempotent_lookup |
| 20260910064827 | seed_upthink_product_catalog |
| 20260910104257 | harden_sepay_payment_processing_bridge |
| 20260910113533 | configure_product_image_storage |
| 20260910113635 | create_product_images_storage_bucket |
| 20260910113719 | link_admin_users_to_auth_users |
| 20260910113813 | remove_duplicate_payment_transaction_index |
| 20260911150115 | create_private_try_on_storage |
| 20260911150224 | create_try_on_jobs |
| 20260911151500 | create_product_vision_attributes |
| 20260911151511 | add_product_vision_admin_write_policy |
| 20260912064636 | create_site_theme_settings |
| 20260912133246 | add_momo_payment_method |
| 20260912133311 | allow_momo_in_create_order_atomic |
| 20260912134507 | 20260912143000_add_momo_payment_processing |
| 20260912134549 | 20260912143500_harden_momo_payment_rpc |
| 20260912135617 | add_guest_order_tracking |

## Migration files currently present in GitHub

Only these migration files are currently present under `supabase/migrations/` on this branch:

- `20260911152000_create_try_on_jobs.sql`
- `20260911210000_create_private_try_on_storage.sql`
- `20260911232000_create_product_vision_attributes.sql`

Therefore the live database has substantial migration drift relative to the repository.

## Live public tables audited

- `products`
- `product_variants`
- `product_images`
- `orders`
- `order_items`
- `payments`
- `payment_events`
- `admin_users`
- `site_theme_settings`
- `try_on_jobs`
- `product_vision_attributes`

## Live functions audited

The live `public` schema currently contains these application/security functions:

- `create_order_atomic(text,text,text,text,text,text,text,text,jsonb,text)`
- `create_payment_for_order(uuid)`
- `find_sepay_payment(text,text)`
- `is_admin()`
- `is_admin_user()`
- `process_momo_payment(text,text,text,text,integer,integer,jsonb)`
- `process_sepay_payment(text,text,text,text,integer,text,jsonb)`
- `record_payment_event()`
- `rls_auto_enable()`
- `set_payments_updated_at()`
- `set_product_vision_attributes_updated_at()`
- `set_products_updated_at()`
- `set_site_theme_updated_at()`
- `set_try_on_jobs_updated_at()`
- `sync_order_payment_status()`
- `track_guest_order(text,text)`
- `verify_payment_status(uuid,text,text,text,text,jsonb)`

## Important reconciliation findings

1. `create_order_atomic()` exists in the live database but its migration SQL is not present in the current GitHub migration directory.
2. `process_momo_payment()` exists in the live database but its migration SQL is not present in the current GitHub migration directory.
3. The live database contains the MoMo migrations dated 2026-09-12, while the repository migration directory currently contains only the three later/parallel feature migrations listed above.
4. `product_images_storage.sql` is a standalone SQL script rather than a timestamped migration. It configures the `product-images` bucket and admin storage policies.
5. `supabase/seed/001_development.sql` is seed data and does not replace missing schema/function migrations.
6. Several SECURITY DEFINER functions and trigger functions require continued security review before any migration reconstruction is applied to production.

## Rule for next reconciliation step

Do not reset production, disable RLS, or execute reconstructed SQL against production merely to make the migration ledger match. First reconstruct and review the missing SQL, then validate it against the live schema and only then decide whether a baseline/squashed migration strategy is appropriate.
