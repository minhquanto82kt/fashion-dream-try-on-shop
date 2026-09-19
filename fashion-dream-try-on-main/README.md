# WEARO — Fashion Commerce + AI Try-On

WEARO is a customer-facing **casual, modern and unisex** fashion commerce experience with AI-assisted styling and Virtual Try-On.

The repository also contains **UpThink**, the internal control layer used to operate how WEARO works: catalog, inventory, orders, appearance/content settings and AI configuration.

## Brand architecture

```text
UPTHINK
Internal control / admin
        ↓
WEARO
Customer-facing fashion brand
```

- Public storefront → **WEARO**
- `/admin` → **UpThink / WEARO Control System**
- Supabase → source of truth for production data
- GitHub → source of truth for application code
- Vercel → deployment/runtime

## Stack

- React 19 + TypeScript
- TanStack Start / Router
- Vite
- Supabase Auth + PostgreSQL + RLS
- AI SDK / server-side AI integrations
- Vercel deployment
- npm 11 / Node 24

## Development

```bash
npm install
npm run dev
```

Recommended verification before pushing:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layers, ownership and data boundaries
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — development/change workflow
- [`docs/BRAND-SYSTEM.md`](docs/BRAND-SYSTEM.md) — WEARO/UpThink brand contract
- [`docs/ADMIN-AUTH-RUNBOOK.md`](docs/ADMIN-AUTH-RUNBOOK.md) — `/admin` auth/RLS troubleshooting
- [`docs/DEPLOYMENT-RUNBOOK.md`](docs/DEPLOYMENT-RUNBOOK.md) — Vercel release and production verification
- [`TYPOGRAPHY.md`](TYPOGRAPHY.md) — typography rules

## WEARO visual hierarchy

Primary: `#54728C`

Secondary: `#F2AD94`

Neutral: `#FFFFFF`

Supporting tones: `#7794A6`, `#F2CEAE`, `#D9BBA9`

## Engineering rules

1. Supabase is the production data source of truth.
2. Keep CRUD, authorization and RLS explicit.
3. Never expose service-role or provider secrets to the client.
4. Prefer minimal changes over rewrites.
5. Do not mark a feature complete based only on a GitHub commit; verify build/runtime behavior.
6. Keep UpThink and WEARO distinct: operator layer vs customer brand.
