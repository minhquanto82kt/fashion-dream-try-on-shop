# Routes and Components

## Purpose

Define route ownership and prevent duplicate components or accidental cross-route UI changes.

## Route Rules

| Route | Owner | Scope |
|---|---|---|
| `/` | `src/routes/index.tsx` | Homepage/editorial experience |
| `/shop` | `src/routes/shop.tsx` | Catalogue |
| `/product/$id` | `src/routes/product.$id.tsx` | Product detail |
| `/ai` | `src/routes/ai.tsx` | AI Try-On |
| `/cart` | `src/routes/cart.tsx` | Cart |
| `/checkout` | `src/routes/checkout.tsx` | Checkout |
| `/admin` | `src/routes/admin/` | Admin |
| `/admin/products` | `src/routes/admin/products/` | Product administration |
| `/admin/orders` | `src/routes/admin/orders/` | Order administration |

## Component Rules

Before creating a component:

1. Search `src/components/`.
2. Search the current route for an existing local implementation.
3. Search for equivalent behavior under another route.
4. Reuse or extend the existing component when appropriate.

Do not create multiple components that solve the same UI problem under different names.

## Route Isolation

A route-specific change must remain route-specific unless there is a documented reason for shared behavior.

Do not use global selectors to solve an isolated route problem when a scoped selector can solve it.

## Shared Component Changes

When modifying a shared component:

- search all usages;
- identify affected routes;
- preserve existing props/contracts unless the feature requires change;
- test the routes that consume it.

## Admin Rules

Admin UI is not itself an authorization boundary. Sensitive actions must be protected by the appropriate server/database authorization model.

## Update Requirement

When a new route or meaningful component ownership boundary is introduced, update `PROJECT_MAP.md` and this document.
