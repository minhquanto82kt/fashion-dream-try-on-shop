# Deployment Rules

## Purpose

Keep GitHub, Vercel, and production verification aligned.

## Environments

Always distinguish:

- Local development;
- Vercel Preview;
- Vercel Production.

## Deployment Flow

`GitHub Commit → Vercel Deployment → Build → Environment Variables → Runtime → Browser → Supabase/Providers`

## Verification

Do not call a feature complete based only on:

- a GitHub commit;
- a successful Vercel deployment creation;
- a successful build.

Verify runtime behavior when possible.

## Environment Variables

When a feature works locally but fails on Vercel, check environment variables and server/client boundaries before rewriting application logic.

Never commit secrets into the repository.

## Branch Safety

Deploy the intended branch/commit and verify that the Vercel deployment corresponds to that commit.

## Rollback Mindset

For a regression, identify the last known-good commit and the smallest change that introduced the problem before making additional changes.

Do not rewrite published history as a shortcut.
