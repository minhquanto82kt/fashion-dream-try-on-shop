# Change Rules

## Purpose

Rules for changing the existing Fashion Dream Try-On Shop without causing unrelated regressions.

## 1. Change the Owner File

Before editing:

- identify the route or feature owner;
- inspect the existing implementation;
- search for consumers/dependencies;
- determine whether a shared component or stylesheet is affected.

Prefer the smallest set of files that can correctly solve the problem.

## 2. Minimal Change Principle

Use:

`Problem → Diagnose → Owner → Minimal Change → Test → Regression Check → Commit`

Do not rewrite working code merely because another implementation looks cleaner.

## 3. Preserve Existing Behavior

Unless explicitly requested, preserve:

- routes;
- working components;
- data contracts;
- database schema;
- authentication;
- RLS;
- current visual direction;
- responsive behavior;
- existing asset usage.

## 4. Shared Code Safety

Before changing a shared component, hook, utility, or global stylesheet:

1. search its usages;
2. identify affected routes;
3. assess regression risk;
4. prefer a scoped change if possible.

A route-specific problem should normally receive a route-specific solution.

## 5. CSS Changes

Follow `CSS_UX_UI_RULES.md`.

Never add a broad selector or late override simply because it makes one screenshot look correct. Check the cascade, specificity, imports, DOM structure, assets, positioning, and responsive breakpoints first.

## 6. Data Changes

Follow `DATABASE_RULES.md` and `CRUD_RULES.md`.

Do not change schema, RLS, or production data as a shortcut for a UI problem.

## 7. Destructive Changes

Deletion, schema changes, removal of working components, and changes to transaction logic require explicit reasoning about impact.

Orders and payments are transaction history and must not be hard-deleted casually.

## 8. Documentation Feedback Loop

When a bug is fixed:

- if it is a reusable lesson, add it to `REGRESSION_LOG.md`;
- if the lesson changes a permanent development rule, update the relevant rules file;
- keep documentation focused and avoid duplicate rules.

## 9. Commit Discipline

Prefer focused commits describing one logical change.

Examples:

- `fix(home): restore manifesto background`
- `fix(admin): correct order status update`
- `docs: add regression prevention rule`

Do not mix unrelated cleanup into a focused bug fix.
