# Security Rules

## Purpose

Security guardrails for vibe-coding and production changes.

## Secrets

Never put these in client-side code, source control, or public assets:

- Supabase service-role credentials;
- private API keys;
- AI provider secrets;
- payment provider secrets;
- passwords or private tokens.

Public browser-safe configuration must be clearly distinguished from privileged credentials.

## Authentication vs Authorization vs RLS

- Authentication answers who the user is.
- Authorization answers what the user is allowed to do.
- RLS enforces database access rules.

Hiding a button in the UI is not authorization.

## Admin

Admin actions must be protected by the server/database authorization model, not only by route visibility or frontend checks.

## Database

- Keep RLS enabled.
- Never bypass RLS as a shortcut.
- Verify policies for the exact operation.
- Do not expose privileged database clients to the browser.

## Uploads and AI

Validate uploaded files before processing. Keep AI provider credentials server-side and validate external responses before storing or rendering them.

## Security Regression

If a security issue is discovered, document the root cause and prevention rule in `REGRESSION_LOG.md` and update this file when the lesson should become permanent.
