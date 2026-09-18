# Foundation Phase 1 — WEARO City Modernization

## Scope

This phase combines the eight foundation workstreams into one delivery track:

1. Product source of truth
2. Authentication and authorization
3. Supabase/RLS security
4. UpThink → WEARO brand cleanup
5. Repository structure
6. CSS/design-system hygiene
7. Error handling
8. Automated test foundation

## Visual preservation contract

This phase is an engineering/foundation refactor, not a visual redesign.

- Preserve the existing website palette.
- Preserve the existing typography system, including font family, weights, sizes, line heights, and hierarchy.
- Do not introduce a replacement color palette.
- Do not replace the storefront's visual language.
- Do not use CSS cleanup as a reason to redesign components.
- Any future visual redesign must be a separate, explicitly approved workstream.

## Product contract

Supabase is the production source of truth for database-backed products. Runtime storefront code must not use a second hard-coded product catalogue. `src/lib/product-domain.ts` is the application contract and mapper layer; it is not a catalogue.

Legacy product fixtures may remain only when explicitly scoped to tests, demos, or migration tooling and must never become production runtime data.

## Identity contract

Client input must not be trusted to establish ownership. Server code resolves the authenticated identity and then applies authorization. Database RLS remains the final data boundary.

`Authentication != Authorization != RLS`.

## Repository contract

`fashion-dream-try-on-main/` is the application root. Root-level legacy code must be classified before removal. No file is deleted solely for cosmetic cleanup when runtime/deployment usage has not been verified.

## Error contract

Application errors use stable domain codes from `src/lib/errors.ts`. User-facing messages may be friendly, while logs retain technical context. Secrets, access tokens, payment credentials, and private image URLs must never be included in client-facing errors.

## QA gate

The phase is not complete until the repository can pass, as applicable:

- lint
- production build
- foundation architecture checks
- frontend route smoke tests
- Python tests
- security/RLS checks where executable in CI

## Delivery rule

Prefer small, reviewable commits inside this single phase. Do not change visual behavior unless required to correct an actual regression introduced by the foundation work.
