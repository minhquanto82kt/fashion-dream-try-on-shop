# WEARO Architecture — P0 Baseline

## Canonical application

The active web application is `fashion-dream-try-on-main/`.

- Frontend/runtime source: `fashion-dream-try-on-main/src/`
- TypeScript server functions/API boundary: `fashion-dream-try-on-main/src/lib/*.server.ts`, `*.functions.ts`, and `fashion-dream-try-on-main/src/routes/api/`
- Python AI service: `fashion-dream-try-on-main/python/app/`
- Supabase migrations: `fashion-dream-try-on-main/supabase/`
- CI build/test working directory: `fashion-dream-try-on-main/`

The repository-root `src/` tree is legacy source and is not part of the active application. It must not receive new features or be used as a second implementation of an active domain.

## AI Virtual Try-On boundary

AI Try-On has one request path with explicit layers:

`UI (/ai) → TanStack server function → FastAPI internal bridge → provider/storage/job service → result → UI`

The TypeScript layer is the web/BFF boundary. The Python layer is the AI execution/service boundary. They are not two competing product implementations.

The active TypeScript entry points are `src/lib/ai.functions.ts` and `src/routes/ai.tsx`. The Python service is exposed through `api/[...path].py` and `python/app/main.py`.

## P0 rules

1. Do not add files or modules solely to enlarge repository visualizations.
2. Do not create a second implementation of Product, Order, Payment, or AI Try-On when an active domain already exists.
3. New functionality must extend the canonical application and preserve the existing data source of truth.
4. Root-level legacy `src/` must remain frozen until it is removed in a separately verified cleanup change.
5. Any future Code City / repository visualization should treat the canonical application as the architecture source.

## Current P0 decision

- Canonical app: `fashion-dream-try-on-main/`.
- AI orchestration boundary: TypeScript server functions.
- AI execution boundary: Python/FastAPI.
- Provider boundary: `TryOnService` / configured provider adapters.
- Database/storage source of truth: Supabase.
- Legacy root `src/`: frozen; no new code.
