# Project Map

## Purpose

A concise map of the repository so AI coding assistants can locate existing implementations before creating new ones.

## Application Root

`fashion-dream-try-on-main/`

## Main Source Areas

```text
src/
├── routes/          # application routes and route-specific screens
├── components/      # reusable UI components
├── data/             # data definitions/static editorial data where applicable
├── hooks/            # reusable React hooks
├── lib/              # shared integrations and utilities
├── styles/           # project styles and route/feature styling
├── server.ts         # server entry/integration
├── start.ts          # application start entry
└── styles.css        # main stylesheet entry
```

## Python AI Areas

```text
python/
├── app/api/                  # authenticated AI API endpoints
├── app/models/               # provider-agnostic domain contracts
├── app/services/             # orchestration and provider adapters
│   ├── try_on_service.py     # provider selection/orchestration
│   ├── fashn_provider.py     # FASHN hosted API adapter
│   └── fashn_vton_provider.py # self-hosted GPU service HTTP adapter
└── tests/                    # Python service tests
```

The self-hosted VTON adapter is only an HTTP client. PyTorch and FASHN VTON model dependencies belong to the separate GPU inference service, not the main application runtime.

## Route Ownership

```text
/                    → src/routes/index.tsx
/shop                → src/routes/shop.tsx
/product/$id         → src/routes/product.$id.tsx
/ai                  → src/routes/ai.tsx
/cart                → src/routes/cart.tsx
/checkout            → src/routes/checkout.tsx
/admin               → src/routes/admin/
/admin/products      → src/routes/admin/products/
/admin/orders        → src/routes/admin/orders/
```

## Important Data Areas

- Products → Supabase product data and related product UI.
- Cart → cart state and product references.
- Orders → `orders` and `order_items`.
- Payments → payment-related data and verification flow.
- AI Try-On → upload/input, server processing, provider, result, storage, UI.

## Important Styling Areas

Homepage visual work should inspect the homepage route and relevant styles before adding overrides. Current homepage continuity is:

`Hero → Manifesto → AI Studio → Collection → Experience`

Critical editorial assets belong in `public/images/` when they are local project assets.

## Existing-Implementation Rule

Before creating a new component, hook, utility, route, or stylesheet:

1. Search this map.
2. Search the repository.
3. Reuse the existing implementation when it already owns the requested behavior.

Update this map when a meaningful route, component ownership, data layer, or architecture boundary changes.
