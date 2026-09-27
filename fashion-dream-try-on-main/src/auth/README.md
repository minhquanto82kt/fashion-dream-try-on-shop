# WEARO Auth

This directory is the public boundary for authentication flows.

- `index.ts` is the stable import surface for routes/components.
- Customer authentication remains backed by the existing Supabase Auth implementation.
- Admin authentication remains isolated from customer sessions.
- Supabase email templates stay in Supabase Dashboard; the app only triggers the corresponding Auth flows.

This first extraction intentionally preserves the existing authentication implementation to avoid breaking Account, Cart, Order, or Admin behavior. Further module extraction should move one flow at a time behind the exports in `index.ts`, followed by typecheck/build and end-to-end Auth verification.
