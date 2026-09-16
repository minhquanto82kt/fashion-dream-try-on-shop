# AI Coding Protocol

## Purpose

This document defines how AI coding assistants must work on Fashion Dream Try-On Shop.

The objective is to make vibe-coding predictable, minimal, reversible, and safe.

## 1. Before Coding

1. Read `AGENTS.md`.
2. Read `docs/DEVELOPMENT_RULES.md`.
3. Read this document.
4. Read the relevant specialized rules before touching code.
5. Inspect the existing implementation before creating or replacing anything.
6. Identify the exact route, component, data source, and owner file.
7. Check `docs/PROJECT_MAP.md` and `docs/REGRESSION_LOG.md` when relevant.

Never start by rewriting a component from scratch without first inspecting the existing implementation.

## 2. Select Relevant Rules

- CSS/UI task → `CSS_UX_UI_RULES.md`
- Data/CRUD task → `DATABASE_RULES.md`, `CRUD_RULES.md`
- Route/component task → `ROUTES_AND_COMPONENTS.md`
- API/server task → `API_RULES.md`, `SECURITY_RULES.md`
- AI Try-On task → `AI_TRYON_RULES.md`
- Deployment task → `DEPLOYMENT_RULES.md`
- Testing task → `TESTING_RULES.md`
- Any structural change → `ARCHITECTURE.md`, `CHANGE_RULES.md`

## 3. During Coding

- Make the smallest safe change.
- Reuse existing components and data-access functions when appropriate.
- Do not create duplicate implementations.
- Do not change unrelated routes.
- Do not change framework or architecture unless explicitly required.
- Do not change database schema merely to make a UI issue disappear.
- Do not disable RLS.
- Do not expose secrets to client code.
- Keep route-specific CSS scoped.
- Preserve existing visual direction, palette, typography, and responsive behavior unless explicitly requested otherwise.

## 4. Error Handling

When an error occurs, do not immediately add another workaround.

Use:

`Symptom → Layer → Root Cause → Minimal Fix → Regression Test`

Check the appropriate layer in this order:

`UI → Request → Server/API → Supabase → Auth/RLS → Database Constraint → Response → UI Refresh`

For CSS problems, additionally inspect:

`DOM → selector specificity → cascade/import order → positioning/z-index → asset path → responsive breakpoint`

## 5. Regression Learning

If a resolved error reveals a reusable lesson:

1. Add the incident to `docs/REGRESSION_LOG.md`.
2. Update the relevant rule document if the lesson should become a permanent rule.
3. Do not add duplicate or overly specific rules that only describe one accidental symptom.
4. Keep the rule general enough to prevent the class of problem from recurring.

The regression log is the project's technical memory.

## 6. After Coding

Before declaring completion:

- Verify the affected feature.
- Check nearby functionality for regressions.
- Check desktop and mobile when UI changes are involved.
- Confirm asset paths and loading when assets changed.
- Confirm database/RLS behavior when data changed.
- Confirm server/client boundaries when API or secrets are involved.
- Run the appropriate build/test checks.
- Update documentation when a new reusable lesson was discovered.
- Commit code and documentation together when they belong to the same fix.

A successful code edit is not the same as a verified feature.

## 7. Forbidden Vibe-Coding Patterns

Do not:

- rewrite the whole page to fix one component;
- create duplicate CSS files without a clear ownership reason;
- create duplicate components for an existing feature;
- silently replace live data with mock data;
- hard-code production database records into UI code;
- use display names instead of stable IDs for database updates;
- mark payment as successful without verification;
- delete transaction history casually;
- add external assets when a local canonical asset already exists;
- use recursive/self-referencing image assets;
- hide layout problems with arbitrary `overflow: hidden`;
- use broad global CSS to solve a route-specific issue;
- claim production verification based only on a successful build.

## 8. Definition of Done

`Correct implementation + preserved existing behavior + appropriate testing + documentation update when needed + deployment verification`
