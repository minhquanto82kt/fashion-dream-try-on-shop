# Fashion Dream Try-On Shop — Development Rules

## 1. Purpose

This document is the working source of truth for development decisions in `fashion-dream-try-on-main`.

The project uses:

- GitHub as the source of truth for source code.
- Supabase as the source of truth for application data.
- Vercel for deployment.
- Server-side functions/API for operations that require secrets or privileged access.

The goal is to make changes predictable, minimal, testable, and safe for existing features.

---

## 2. Core Engineering Principles

### 2.1 Minimal Change

Before changing code:

1. Find the existing implementation.
2. Identify the exact file and component involved.
3. Check dependencies and consumers.
4. Change only what is necessary.
5. Preserve existing working behavior.
6. Do not create duplicate components or parallel data structures.

Do not rewrite the application, change frameworks, or reorganize the repository unless explicitly required.

### 2.2 One Source of Truth

Each business entity should have one canonical data source.

Do not maintain separate competing versions of Products, Orders, Users, Payments, or other database-backed entities in different components.

Static mock data may be used only where the feature is explicitly designed as static/editorial content. It must not silently replace live database data.

### 2.3 Data Before UI

For data-backed features, understand the data flow before changing the UI:

`Table → Column → Primary Key → Foreign Key → RLS → Query → Response → UI`

### 2.4 Preserve Existing Routes

A change to one route must not unintentionally modify another route.

Especially protect:

- `/`
- `/shop`
- `/product/$id`
- `/ai`
- `/cart`
- `/checkout`
- `/account`
- `/admin`

Do not make global CSS or shared-component changes when a route-scoped change is sufficient.

---

## 3. CRUD Rules

Every data feature must first be described as:

`Create → Read → Update → Delete`

Not every entity requires every CRUD operation. The allowed operations depend on business rules and data integrity.

### 3.1 CREATE

Before implementing CREATE, identify:

- target table/entity;
- required fields;
- primary key generation;
- foreign keys;
- authenticated user/role;
- server/client boundary;
- validation;
- RLS INSERT policy;
- success response;
- UI refresh/refetch behavior.

Dynamic production data must not be hard-coded into the frontend.

### 3.2 READ

READ must use the project's canonical source of truth.

Check:

- table and columns;
- selected fields;
- filters;
- ordering;
- pagination if applicable;
- authentication;
- RLS SELECT policy;
- loading/empty/error states.

Do not create a second query or data model when an existing canonical data-access function already serves the same purpose, unless there is a documented reason.

### 3.3 UPDATE

UPDATE must target a stable record identifier, normally the primary key.

Do not update records by display name when an ID exists.

Before UPDATE, verify:

- record ID;
- fields allowed to change;
- current record state;
- authorization;
- RLS UPDATE policy;
- database constraints;
- optimistic vs refetch UI behavior.

### 3.4 DELETE

Every DELETE must explicitly state its strategy:

- hard delete;
- soft delete; or
- delete not allowed.

Never add destructive deletion merely because a CRUD screen is expected to have a Delete button.

Orders, payments, and other transaction-history records should normally not be hard-deleted.

Destructive actions require appropriate confirmation and error handling.

---

## 4. Supabase Rules

For every Supabase-backed feature, verify in this order:

`Table → Column → Primary Key → Foreign Key → RLS → Query → Response`

Rules:

- Database is the source of truth.
- Keep RLS enabled.
- Do not disable RLS to make a feature work.
- Do not expose `service_role` or other server secrets to client code.
- Use stable IDs for relationships and updates.
- Do not change schema unless the feature actually requires it.
- Do not modify production data without explicit confirmation when the action is destructive or irreversible.

When a CRUD operation fails, debug in this order:

`UI → Request → Server Function/API → Supabase Query → Auth/RLS → Database Constraint → Response → UI Refresh`

---

## 5. Authentication and Authorization

Separate these concepts:

- authentication: who the user is;
- authorization: what the user is allowed to do;
- RLS: what the database permits.

A UI restriction is not a security boundary.

Admin-only actions must be protected by the server/database authorization model, not only by hiding buttons in the frontend.

Never put private API keys or privileged Supabase credentials in client-side code.

---

## 6. Product Data

Products should have one canonical representation between Supabase, server/data-access functions, and UI components.

Before changing Product behavior, check:

- product ID;
- publication/active state;
- category;
- price;
- images;
- variants;
- stock;
- relationships used by cart/order/AI features.

Product detail, catalogue, cart, and AI Try-On should not invent incompatible Product object structures.

---

## 7. Cart, Order, and Payment

Preferred business flow:

`Cart → Create Order → Pending Payment → Payment → Verify Payment → Update Payment Status → Update Order Status`

Rules:

- Creating an order and verifying payment are separate operations.
- Opening a QR/payment page does not mean payment is successful.
- Payment status must come from a verification mechanism.
- Do not mark an order `paid` merely because the user clicked a payment button.
- Do not hard-delete order/payment history as a normal CRUD operation.
- Preserve transaction history needed for administration and reconciliation.

Any change to Order or Payment must check existing `orders`, `order_items`, and payment-related schema/code before changing the database.

---

## 8. AI Try-On / AI Features

Preferred flow:

`Upload/Input → Server → AI Provider → Result → Storage → UI`

Rules:

- AI provider secrets stay server-side.
- Validate file type and size before processing.
- Handle loading, empty, success, and error states.
- Handle provider timeout/failure explicitly.
- Do not expose provider API keys in browser code.
- Keep AI result data compatible with the project's existing Product/Cart architecture.
- Do not add an AI provider solely because its model is stronger; consider compatibility, latency, cost, quality, timeout behavior, and storage.

---

## 9. UI/UX Rules

Every data-backed interface should provide the states appropriate to the feature:

- loading;
- empty;
- error;
- success feedback;
- validation;
- confirmation for destructive actions.

### 9.1 Visual Safety

Do not change the existing visual system unless explicitly requested.

Current project visual rules:

- preserve the existing color palette;
- preserve the existing font family/typography system;
- improve UX/UI without replacing the brand direction;
- avoid generic AI-generated visual patterns;
- prefer route-scoped CSS for route-specific changes;
- avoid global CSS changes when they could affect unrelated pages.

### 9.2 Homepage Safety

The homepage is an editorial composition. When modifying one section:

- preserve existing backgrounds unless a background change is explicitly requested;
- preserve Hero → Manifesto → AI Studio → Collection → Experience continuity;
- do not let Hero-specific CSS override Manifesto or other sections;
- verify section transitions after visual changes;
- do not add decoration without considering information hierarchy.

The existing brand label `AI TRY-ON (BETA)` must remain exactly as written unless explicitly changed by the owner.

---

## 10. Component and CSS Rules

Before creating a component, search the repository for an existing equivalent.

Rules:

- reuse existing shared UI components where appropriate;
- do not create duplicate sidebar/sheet/drawer/command components;
- keep route-specific styling scoped;
- avoid broad selectors such as `body`, `main`, generic `h1`, or generic `.container` for a single-route visual change;
- preserve responsive behavior;
- test both desktop and mobile layouts after significant UI changes.

---

## 11. Change Workflow

Use this sequence for every meaningful change:

1. **Problem** — define the exact issue/request.
2. **Diagnose** — inspect the existing implementation.
3. **Layer** — identify UI, data, server, database, auth, or deployment layer.
4. **File** — identify the smallest set of files that need modification.
5. **Minimal Change** — implement only the required change.
6. **Test** — verify the affected feature and nearby dependencies.
7. **Commit** — use a focused commit message.
8. **Deploy** — allow/trigger Vercel deployment as appropriate.
9. **Verify** — check the deployed environment before calling the work complete.

Do not skip diagnosis and jump directly to rewriting code.

---

## 12. Verification Checklist

Before considering a change complete:

### Code

- [ ] Correct file was changed.
- [ ] No duplicate component/data structure was introduced.
- [ ] No unrelated route was intentionally or unintentionally changed.
- [ ] No secrets were added to client code.

### Data

- [ ] Table/columns were checked.
- [ ] PK/FK relationships were checked.
- [ ] RLS/auth requirements were checked.
- [ ] Query and response shape were checked.

### UI

- [ ] Loading state works where applicable.
- [ ] Empty state works where applicable.
- [ ] Error state works where applicable.
- [ ] Success feedback works where applicable.
- [ ] Desktop layout checked.
- [ ] Mobile layout checked.
- [ ] Existing palette and typography remain unchanged.

### Deployment

- [ ] GitHub commit exists on the intended branch.
- [ ] Vercel deployment corresponds to the intended commit.
- [ ] Build completed successfully.
- [ ] Runtime behavior was checked where applicable.
- [ ] Production/Preview environment variables are correct when relevant.

Do not claim a feature is production-verified based only on a successful GitHub commit or Vercel build.

---

## 13. When Information Is Missing

Do not request the entire repository unless necessary.

Request only the evidence needed to diagnose the current layer, such as:

- exact file;
- relevant code block;
- screenshot;
- browser console error;
- Network request/response;
- Vercel build/runtime log;
- Supabase error or relevant schema/policy.

If the available code does not support a conclusion, state what is unknown instead of guessing.

---

## 14. Definition of Done

A change is complete only when:

`Correct implementation + preserved existing behavior + appropriate testing + deployment verification`

A successful commit is not by itself a completed feature.
