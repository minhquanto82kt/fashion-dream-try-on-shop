# Regression Log

## Purpose

This file is the project's technical memory for bugs and regressions discovered during development and vibe-coding.

Every resolved issue that contains a reusable lesson should be recorded here.

## How to Use

For each meaningful regression, record:

- ID;
- date;
- affected area;
- symptom;
- root cause;
- fix;
- prevention rule;
- related files;
- verification status.

## Rule

A regression entry records the incident. A relevant rules document records the permanent prevention rule when the lesson is reusable.

Do not turn every one-off mistake into a complicated permanent rule.

---

## REG-001 — Homepage Manifesto Background / Typography Regression

### Date

2026-09-16

### Area

Homepage / Manifesto section

### Symptoms

- Intro/Manifesto background image was not rendering correctly.
- Editorial typography became visually too compressed/clumped.

### Root Causes

- The critical background asset path/implementation was fragile during previous CSS/image changes.
- An incorrect recursive SVG reference was introduced during debugging and was not a valid standalone asset strategy.
- Typography used overly tight tracking/line-height for the editorial heading.
- Multiple stylesheet/override layers increased cascade and stacking complexity.

### Fix

- Use the real uploaded local asset: `public/images/fashion-5-people-bg.png`.
- Render the critical image through an explicit `.fashion-intro-bg` DOM layer.
- Scope the background and stacking rules to the Manifesto section.
- Adjust editorial typography to safer letter-spacing and line-height values.
- Remove the duplicate stylesheet registration.
- Remove the invalid recursive SVG asset.

### Prevention Rules

- Critical local editorial assets should use stable local paths.
- Never create recursive/self-referencing image assets.
- Background image layers must have explicit ownership, positioning, and stacking behavior.
- Do not solve a typography issue with extreme negative letter-spacing.
- Avoid duplicate stylesheet imports and competing override layers.
- Verify the affected section and neighboring sections after CSS changes.

### Related Files

- `src/routes/index.tsx`
- `src/styles/home-fixes.css`
- `src/styles.css`
- `src/routes/__root.tsx`
- `public/images/fashion-5-people-bg.png`
- `docs/CSS_UX_UI_RULES.md`

### Status

Resolved. Visual verification was performed by the project owner after deployment.

---

## Future Entries

Use the next available ID: `REG-002`, `REG-003`, etc.
