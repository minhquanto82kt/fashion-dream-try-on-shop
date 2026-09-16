# API Rules

## Purpose

Rules for browser, server, Supabase, AI provider, payment, and other API boundaries.

## Boundary

Preferred pattern:

`Browser → Server/API → Supabase or External Provider`

Client code must not receive privileged credentials.

## Request Rules

- Validate inputs at the server boundary.
- Validate file type and size for uploads.
- Do not trust client-provided authorization claims.
- Use stable IDs for record operations.
- Return predictable success and error responses.

## Error Handling

Explicitly handle:

- validation errors;
- authentication/authorization errors;
- provider failures;
- database errors;
- timeouts;
- malformed responses.

Do not hide an API error by returning fake success data.

## Secrets

API keys, service-role credentials, payment secrets, and AI provider secrets must remain server-side.

## Data Fetching

Use existing canonical data-access functions when they already provide the required behavior. Do not create competing query implementations without a documented reason.

## Debugging

Trace failures in order:

`UI → Request → Server/API → Provider/Supabase → Response → UI`

Inspect the actual request and response before changing business logic.
