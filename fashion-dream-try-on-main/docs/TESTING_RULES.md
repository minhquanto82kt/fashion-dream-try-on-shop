# Testing Rules

## Purpose

Prevent the common mistake of treating a successful code edit or build as proof that the feature works.

## Required Flow

`Code → Build/Test → Functional Check → Regression Check → Deployment Check`

## UI Changes

Check when applicable:

- affected section;
- neighboring sections;
- navigation;
- images/assets;
- typography;
- loading/error/empty states;
- desktop;
- tablet;
- mobile.

Homepage visual changes must check continuity across:

`Hero → Manifesto → AI Studio → Collection → Experience`

## Data Changes

Verify:

- actual request;
- actual response;
- correct record ID;
- RLS/auth behavior;
- UI refresh after mutation;
- failure handling.

## Regression Testing

Test functionality that shares:

- the changed component;
- the changed stylesheet;
- the changed data function;
- the changed API;
- the changed schema.

## Deployment

A successful Vercel build proves that the build completed. It does not by itself prove runtime correctness or visual correctness.

When possible, verify the deployed behavior directly.

## Failure Documentation

When a bug is resolved and contains a reusable lesson, update `REGRESSION_LOG.md` and the relevant rule document.
