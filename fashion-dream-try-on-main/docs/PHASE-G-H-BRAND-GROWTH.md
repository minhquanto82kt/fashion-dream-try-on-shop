# WEARO Phase G/H — Growth & Brand Governance

## Scope

This document closes the operational definition of Phase G and Phase H without redesigning the existing UX/UI.

## Phase G — Growth

- Preserve the existing visual system, palette and typography.
- Keep product/shop URLs crawlable and canonical.
- Keep sitemap/robots and structured data under version control.
- Establish a first-party analytics event vocabulary before adding a vendor SDK.
- Track only product-growth events that map to existing user actions: product view, add to cart, checkout start, purchase completion, AI try-on start and AI result completion.
- Do not add a third-party analytics dependency merely to claim completion.
- Search/discovery must remain server-backed as the catalog grows.

### Growth gate

- SEO metadata exists on public routes.
- Canonical URL helper is centralized.
- Organization/WebSite structured data is emitted.
- Product catalog is server-backed.
- Analytics event names are documented and stable.
- No visual redesign is part of Phase G.

## Phase H — Brand Governance

### Canonical brand

- Name: **WEARO**
- Vietnamese tagline: **Mặc theo cách của riêng bạn**
- English tagline: **Wear it your way**
- Product positioning: fashion commerce + AI Virtual Try-On + AI Personal Stylist.

### Legacy brand

`UpThink` is historical brand context only. It must not be a runtime technical dependency or the primary public brand.

If retained as an Easter egg, it must be intentional, isolated and non-essential to the product flow.

### Brand gate

- Central brand constants live in `src/lib/brand.ts`.
- Public metadata should use WEARO.
- Visual assets and layout remain unchanged unless a UI task explicitly authorizes a change.
- CI should detect accidental legacy-brand leakage in public-facing branding.

## UI protection rule

Phase G/H commits must not modify protected visual files unless the commit explicitly concerns an approved UI change. Documentation, CI, SEO, analytics vocabulary and brand governance should be implemented without redesigning the interface.
