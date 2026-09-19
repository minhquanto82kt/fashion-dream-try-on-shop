# WEARO — Development Workflow

## Before coding

1. Identify the layer: UI, domain/lib, API/server, Supabase, auth/RLS, deployment.
2. Find the existing file/component that owns the behavior.
3. Check whether the entity already exists before creating a new abstraction.
4. For data features, map Create → Read → Update → Delete and authorization.

## Local checks

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run test:smoke
npm run test:customer-experience
npm run test:phase-f-b-security
```

Use the exact security script name from `package.json` when running security checks; the repository currently exposes `test:phase-f-security`.

## Change scope

Prefer the smallest change that fixes the root cause. Do not redesign the whole application for a local bug.

### UI

- Keep WEARO customer-facing branding.
- Primary brand color: `#54728C`.
- Secondary accent: `#F2AD94`.
- White is the main neutral surface.
- Keep hover/focus/disabled states consistent.

### Admin

- Admin is an UpThink control layer for WEARO.
- Do not replace UpThink with WEARO inside `/admin`.
- Customer-facing pages remain WEARO.

### Data

- Supabase is the source of truth.
- Never expose service-role or provider secrets in client code.
- Never disable RLS to make a feature work.

## Deployment verification

After a Vercel deployment:

1. Confirm the GitHub commit matches the deployment.
2. Confirm build status is `READY`.
3. Smoke-test `/`, `/shop`, `/about`, `/ai`, `/admin`.
4. For data features, verify the actual Supabase response.
5. Check browser console/network for client errors.

A successful GitHub commit alone is not a production verification.
