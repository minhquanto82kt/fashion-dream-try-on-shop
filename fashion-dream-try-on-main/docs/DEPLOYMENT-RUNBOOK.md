# Deployment & Production Runbook

## Release flow

```text
Problem / feature
    ↓
Diagnose
    ↓
Minimal code change
    ↓
Lint + typecheck + build
    ↓
Smoke tests
    ↓
GitHub commit
    ↓
Vercel deployment
    ↓
READY
    ↓
Route + runtime verification
    ↓
Production
```

## Required checks

```bash
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

Run feature-specific tests when the affected area has them.

## Vercel debugging order

1. GitHub commit/deployment mapping.
2. Build log.
3. Runtime/function log.
4. Environment variables.
5. Supabase URL/key/auth/RLS.
6. Browser console and Network.

## Local vs Preview vs Production

Always state which environment was verified. A local success does not prove Preview or Production behavior.

## Rollback principle

Prefer reverting the smallest bad commit or restoring the previous known-good deployment. Do not rewrite unrelated history or reset the feature branch without confirmation.
