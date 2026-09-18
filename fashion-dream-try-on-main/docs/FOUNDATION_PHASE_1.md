# WEARO Foundation Phase 1 — City Modernization

This phase groups the eight foundation workstreams into one delivery unit. The goal is to stabilize the existing application before adding more commerce and AI surface area.

## Scope

1. Product source of truth
2. Authentication / authorization boundary
3. Supabase / RLS discipline
4. UpThink → WEARO brand migration
5. Repository structure
6. CSS / design-system consolidation
7. Typed error handling
8. Automated test foundation

## Current architecture contract

```text
Supabase products / variants / images
                ↓
        Product Domain Contract
                ↓
      Storefront / AI / Cart / Admin
                ↓
             Checkout
                ↓
        Payment / Order lifecycle
                ↓
        Customer + analytics layer
```

Production product data belongs to Supabase. The old static catalogue in `src/data/products.ts` is legacy compatibility data and must not be expanded. New product-backed features must use the canonical Product Domain contract in `src/lib/product-domain.ts` and server-side data access.

## Security contract

- Authentication identifies the caller.
- Server authorization decides whether the caller may perform an operation.
- Supabase RLS is the final database boundary.
- Never trust a client-supplied `userId` as proof of ownership.
- Service credentials remain server-only.
- Payment status is established by trusted server/provider verification, not client UI state.
- AI uploads require validation, bounded size/type checks, and private storage where applicable.

## Error contract

Use `AppError` from `src/lib/errors.ts` for new domain boundaries. Prefer stable error codes over parsing human-readable error strings.

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
DATABASE_ERROR
PAYMENT_ERROR
AI_ERROR
STORAGE_ERROR
NETWORK_ERROR
INTERNAL_ERROR
```

## UI contract

`src/styles/design-tokens.css` is the shared token layer. Page-specific CSS may consume tokens but should not introduce a second global design vocabulary. New fixes must not create another `*-hotfix.css` file unless there is a documented reason.

## Brand contract

The runtime product identity is WEARO. Existing historical identifiers such as `upthink_*` are migration candidates, not new naming conventions. Do not create new UpThink keys, labels, storage paths, or visible copy.

## Repository contract

The application root is `fashion-dream-try-on-main/`. Root-level legacy code must be classified as one of:

- active application/service code;
- migration source;
- documentation/tooling;
- removable legacy code.

No new application feature should be added to an ambiguous duplicate root `src/` tree.

## Test gate

Before this phase is considered complete, run:

```text
npm run lint
npm run build
npm run test:smoke
npm run test:foundation
pytest
```

The phase is complete only when all five gates pass, or an explicit environment-only failure is documented. A green build alone is not sufficient.

## Remaining coordinated migrations

The foundation contract intentionally does not perform a blind mass replacement of legacy product imports or historical storage keys. Those changes require route-by-route verification so that Product Detail, AI, Cart, Checkout, Admin, and CI fixtures do not regress.
