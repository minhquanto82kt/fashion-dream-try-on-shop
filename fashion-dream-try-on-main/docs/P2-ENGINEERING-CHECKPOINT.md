# WEARO P2 Engineering Checkpoint

## Scope

P2 hardens the existing MVW without replacing the TanStack/Supabase/Vercel architecture.

### P2.1 Architecture / code cleanup
- Keep one source of truth per domain entity.
- Keep server-only secrets and privileged Supabase operations behind server boundaries.
- Mock User is a UX simulation layer, not an authorization bypass.
- Architecture boundary audit runs in CI.

### P2.2 Mock User customer simulator
- Stable preview identity: `WEARO Preview User`.
- Session-scoped activation.
- Centralized login/logout/change events.
- `subscribeToMockUser()` is the single event subscription helper for customer-facing UI.
- Preview checkout never creates a production order or payment.

### P2.3 Commerce hardening
- Real checkout continues to require a customer session.
- Idempotency remains server-side.
- Payment verification remains independent from the UI QR/payment screen.
- Order/payment history is not hard-deleted by preview flows.

### P2.4 AI Try-On hardening
- Internal bridge remains server-authenticated.
- Provider submission, persistence and reconciliation stay separated.
- Polling remains bounded by both attempt count and age.
- Signed result URLs are generated only after completion.

### P2.5 UX/UI system
- WEARO 7x7 matrix remains the source for text/background pair decisions.
- Restricted pairs are rejected by the color audit.
- Contrast guard remains a final CSS safety layer.
- Header/footer and AI surfaces continue using the centralized WEARO visual system.

### P2.6 Performance / observability
- Existing request observability remains in the Python service.
- Error capture preserves the original error/cause chain for server diagnostics.
- CI route/customer smoke tests provide deterministic frontend regression coverage.

## Definition of done

P2 is not considered closed until the latest branch commit has green:

1. Typecheck
2. Lint
3. Architecture audit
4. Python tests
5. Customer experience smoke tests
6. Color audit
7. Production build
8. Vercel Preview verification

No P2 cleanup may remove a feature without replacing its behavior with a simpler or stronger implementation.
