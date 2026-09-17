# Appearance Roadmap QA

Branch: `feature/product-admin`

## Current completion target

- P0-A Appearance Control Center: implemented
- P0-B Theme Workflow: implemented with draft / preview / publish / discard / reset
- P1-A Design System Engine: implemented with semantic tokens, contrast checks and accent shades
- P1-B Brand & Commerce: implemented across Appearance, existing site content controls, branding persistence and favicon persistence
- P2 Theme Library: implemented with snapshots, status, preview, compare and rollback-to-draft
- Buffer: GitHub CI smoke/build verification plus Supabase advisor review and Vercel deployment verification

## Verification notes

- `appearance_themes` exists in Supabase with RLS enabled.
- `appearance_branding` exists in Supabase with RLS enabled.
- `site_content_settings` already contains announcement, hero, social and favicon fields.
- Supabase security advisor still reports four intentional SECURITY DEFINER functions callable by `authenticated`, plus leaked-password protection disabled. These are tracked separately from the Appearance feature and must not be silently weakened.
- Vercel currently reports a build-rate-limit failure for the latest commit, so production verification is not marked PASS until a deployment built from the current branch HEAD is available.
