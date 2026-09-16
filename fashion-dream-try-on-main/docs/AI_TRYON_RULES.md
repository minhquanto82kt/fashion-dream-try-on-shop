# AI Try-On Rules

## Purpose

Architecture and safety rules for AI virtual try-on features.

## Canonical Flow

`Upload/Input → Validation → Server → AI Provider → Result → Storage → UI`

## Provider Rules

Before adding or replacing an AI provider, evaluate:

- API compatibility;
- Vercel/server compatibility;
- latency;
- cost;
- image quality;
- timeout behavior;
- error handling;
- storage requirements.

Do not add a provider solely because its model is stronger.

The application may use a hosted provider or a self-hosted GPU provider behind the same provider abstraction. The browser must not depend on provider-specific endpoints.

## Self-Hosted GPU Rule

Heavy PyTorch/VTON inference must run in a separate GPU service. Do not add PyTorch model dependencies to the Vercel/frontend runtime or the lightweight application API unless the deployment target explicitly supports the required GPU workload.

The main FastAPI service communicates with the GPU service server-to-server and remains responsible for authentication, job ownership, lifecycle orchestration, and persistence.

## Persistent Result Storage Rule

Provider output URLs are temporary execution artifacts and must not become the application's source of truth.

When a provider reports a completed image, the main FastAPI service must:

1. validate the result URL and image response;
2. persist the image in the private `try-on-assets` Supabase Storage bucket;
3. store only the durable storage path in `try_on_jobs.result_image_path`;
4. return a short-lived signed URL to the authenticated frontend when the result is requested.

The GPU service should remain focused on inference and must not expose Supabase service-role credentials to the browser or repository.

## Secrets

Provider API keys and Supabase service-role keys must remain server-side.

## Image Input

Validate:

- file type;
- file size;
- required input fields;
- provider-compatible format.

Do not trust browser validation alone.

## Result Handling

Handle:

- loading;
- success;
- empty result;
- provider failure;
- timeout;
- invalid result;
- storage failure.

Do not render a result as successful until the server confirms a valid result is persisted.

## Product Compatibility

AI Try-On must use the project's canonical Product representation where product data is involved. Do not invent a second incompatible product model.

## Regression Rule

If an AI integration causes a new class of failure, document the incident in `REGRESSION_LOG.md` and update this file when the prevention rule is reusable.
