# Development seed

The seed files in this directory are development-only fixtures.

## Rules

- Use deterministic IDs prefixed with `FD-DEV-` for sample catalog records.
- Never include production customer, order, payment, authentication, webhook, or secret data.
- Do not make the application depend on a seed record existing in production.
- Keep seed data small enough for fast local/test resets.
- If a new table becomes required for a realistic development environment, add a separate ordered seed file rather than modifying unrelated fixtures.

## Current fixture

`001_development.sql` creates two sample products and four variants. Product images are intentionally omitted because storage assets should be managed by the development storage environment.

Orders and payments are intentionally omitted to preserve a clean development/test history.
