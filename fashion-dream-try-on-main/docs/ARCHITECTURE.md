# Architecture

## Purpose

Canonical architecture reference for Fashion Dream Try-On Shop.

## System

`Browser/UI → Routes/Components → Data/API Layer → Supabase or External Provider`

Server-side operations must remain on the server when they require secrets or privileged access.

## Current Application Areas

- Homepage: `/`
- Catalogue: `/shop`
- Product detail: `/product/$id`
- AI Try-On: `/ai`
- Cart: `/cart`
- Checkout: `/checkout`
- Admin: `/admin`
- Admin Products: `/admin/products`
- Admin Orders: `/admin/orders`

## Data Source of Truth

Supabase is the source of truth for database-backed application data.

Do not create competing in-memory, mock, or static representations of live entities unless the feature explicitly requires editorial/static content.

## Product Flow

`Products → Cart → Orders → Order Items → Payment`

Product data should remain compatible across catalogue, product detail, cart, checkout, and AI Try-On.

## Order/Payment Flow

`Cart → Create Order → Pending Payment → Verify Payment → Update Payment Status → Update Order Status`

Opening a payment UI or QR code is not proof of payment.

## AI Try-On Flow

`Upload/Input → Server → AI Provider → Result → Storage → UI`

Provider secrets remain server-side.

## Styling Architecture

Route-specific visual changes should be scoped to the relevant route/section. Global styles must not be used as a shortcut for isolated visual issues.

Current visual direction must be preserved unless the owner explicitly requests a redesign.

## Architecture Change Rule

Do not replace framework, routing, database architecture, or major application structure during a feature fix unless the requirement explicitly calls for it and the impact has been assessed.

Before a structural change, update `PROJECT_MAP.md` and the relevant rules documentation.
