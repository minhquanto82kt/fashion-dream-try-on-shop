# Frontend smoke tests

These checks exercise the deployed/local HTTP surface without changing application code.

Run from `fashion-dream-try-on-main`:

```bash
npm run test:smoke
```

Set `BASE_URL` to test another environment, for example a Vercel Preview deployment.

The smoke suite intentionally checks route availability only. Browser interaction, authentication, CRUD mutations, and AI inference belong to later integration/E2E layers.
