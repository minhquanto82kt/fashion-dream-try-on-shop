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

## Secrets

Provider API keys must remain server-side.

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

Do not render a result as successful until the server confirms a valid result.

## Product Compatibility

AI Try-On must use the project's canonical Product representation where product data is involved. Do not invent a second incompatible product model.

## Regression Rule

If an AI integration causes a new class of failure, document the incident in `REGRESSION_LOG.md` and update this file when the prevention rule is reusable.
