# WEARO Lab

This directory contains legacy and experimental UI/data code that is intentionally preserved outside the production application.

## Role

- Prototype UI and interaction ideas before promotion to production.
- Keep reusable experiments and mock data without coupling them to the production runtime.
- Preserve historical work that may still be useful for future WEARO features.

## Production boundary

The production application lives in `fashion-dream-try-on-main/`.

Code in `lab/` is **not** a production route tree and must not be imported by the production application. When an experiment is promoted, its implementation should be reviewed and deliberately migrated into `fashion-dream-try-on-main/src/` rather than imported directly from `lab/`.

## Structure

- `components/` — preserved UI/component experiments.
- `data/` — preserved mock or prototype data.
- `routes/` — preserved route/flow experiments.

The lab is part of the repository architecture, but it is not part of the Vercel production runtime.
