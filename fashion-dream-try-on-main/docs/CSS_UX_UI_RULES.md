# Fashion Dream Try-On Shop — CSS / UX / UI Safety Rules

## 1. Purpose

This document is the safety guardrail for visual changes in `fashion-dream-try-on-main`.

Its purpose is to prevent regressions such as:

- background images disappearing;
- typography becoming cramped, overlapped, or unreadable;
- one section's CSS leaking into another section;
- desktop fixes breaking mobile layouts;
- duplicate CSS overrides creating unpredictable cascade behavior;
- assets being referenced through fragile or incorrect paths;
- visual fixes working locally but failing after Vercel deployment.

**Rule:** improve the requested visual area without damaging existing UX/UI elsewhere.

---

## 2. Golden Rule: Diagnose Before Styling

Before writing or changing CSS:

1. Identify the exact route.
2. Identify the exact section/component.
3. Find the existing class names and CSS files.
4. Check where those CSS files are imported.
5. Search for duplicate selectors and later overrides.
6. Check whether the problem is actually CSS, an asset path, DOM structure, or loading behavior.
7. Change the smallest possible surface area.

Do not start by rewriting the stylesheet.

---

## 3. CSS Scope Rules

### 3.1 Prefer route/feature-scoped selectors

Use a stable page or feature namespace whenever possible.

Preferred:

```css
.fashion-site .fashion-intro-section .fashion-section-title {
  ...
}
```

Avoid for a single visual change:

```css
h1 { ... }
main { ... }
.container { ... }
img { ... }
```

Generic selectors can silently change unrelated pages.

### 3.2 Do not use global overrides as a shortcut

Avoid adding broad rules merely because they are faster.

Especially avoid unnecessary changes to:

- `body`
- `html`
- `main`
- `h1`, `h2`, `p`, `a`
- generic `.container`, `.section`, `.title`
- all `img`
- all `button`

If a global rule is genuinely required, document why and verify every affected route.

### 3.3 Avoid `!important` by default

Use normal CSS specificity first.

If `!important` is required to protect an existing design from a known competing rule, keep it narrowly scoped and document the reason.

Bad:

```css
* { margin: 0 !important; }
```

Acceptable when justified:

```css
.fashion-site .fashion-intro-section {
  background-image: none !important;
}
```

---

## 4. CSS Cascade and Duplicate Stylesheet Protection

Before adding a new rule:

- search for the same selector in the repository;
- check which stylesheet is imported last;
- check whether a component contains inline styles or Tailwind classes that compete with it;
- check media queries that may override the rule;
- check pseudo-elements (`::before`, `::after`);
- check inherited typography properties.

Do not create a second stylesheet simply to overpower the first one unless there is a clear architectural reason.

If a temporary fix stylesheet is necessary, it must be:

- narrowly scoped;
- imported exactly once;
- documented;
- smaller than the original change it is protecting.

After the fix is stable, consolidate duplicate rules when safe.

---

## 5. Background Image Safety

### 5.1 Prefer repository assets for important visual sections

For production-critical homepage imagery, prefer a real asset stored in the repository:

```css
background-image: url('/images/example.png');
```

or an explicit DOM image layer:

```tsx
<div className="section-bg" aria-hidden="true">
  <img src="/images/example.png" alt="" />
</div>
```

Do not depend on an external image URL when the asset can safely live in `public/images`.

### 5.2 Never create recursive asset references

Never create an SVG or image that references itself, directly or indirectly.

For example, an SVG named `fashion-five-background.svg` must **not** contain an `<image>` pointing back to that same SVG.

This can result in broken rendering, failed requests, or confusing deployment behavior.

### 5.3 Verify the actual asset path

For an asset in:

```text
public/images/fashion-5-people-bg.png
```

its browser path is:

```text
/images/fashion-5-people-bg.png
```

Do not use the filesystem path in browser code.

### 5.4 Do not delete a working background while experimenting

If replacing a background:

1. confirm the new asset exists;
2. confirm the new browser path;
3. implement the new layer;
4. test rendering;
5. only then remove obsolete code/assets if they are truly unused.

---

## 6. Background Layering / Z-Index

When text sits over an image, use an explicit layer model instead of relying on accidental stacking order.

Recommended structure:

```text
Section
├── Background image layer
├── Background overlay layer
├── Decorative pseudo-elements
└── Content layer
```

Example:

```css
.section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.section-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.section-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
}

.section-content {
  position: relative;
  z-index: 3;
}
```

Rules:

- `position: relative` belongs on the section when absolute children are used;
- use `isolation: isolate` when the section needs an independent stacking context;
- do not assign arbitrary high z-index values without understanding the stacking context;
- verify `::before` and `::after` because they can cover images or content;
- do not use `opacity` on the entire section to darken a background because it also fades the content;
- use an overlay layer instead.

---

## 7. Image Rendering Rules

For full-section photography:

```css
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

But `object-fit: cover` intentionally crops the source image.

Therefore, after changing `object-fit`, always check:

- faces;
- hands/body proportions;
- important clothing details;
- logo/text inside an image;
- focal point;
- desktop crop;
- mobile crop.

If important subjects are being cut off, adjust `object-position` or use a more suitable source asset. Do not blindly change dimensions to hide the problem.

For an image that must remain fully visible, consider `object-fit: contain` and design the surrounding background accordingly.

---

## 8. Typography Safety

Typography regressions are treated as functional UX bugs, not cosmetic details.

When changing a heading, verify together:

- `font-family`;
- `font-size`;
- `font-weight`;
- `line-height`;
- `letter-spacing`;
- `max-width`;
- `margin`;
- `text-transform`;
- responsive behavior.

### 8.1 Do not over-tighten editorial typography

Extremely negative letter spacing and very small line-height can make text appear clumped or overlap visually.

Before using values such as:

```css
letter-spacing: -0.07em;
line-height: 0.86;
```

verify the actual font and rendered result at multiple viewport widths.

### 8.2 Preserve readable line boxes

For large display text, do not optimize only for visual compactness.

Check:

- descenders and ascenders;
- multi-line wrapping;
- Vietnamese diacritics;
- punctuation;
- adjacent labels;
- vertical spacing between heading and body copy.

### 8.3 Vietnamese text check

Every significant typography change must be checked with Vietnamese characters such as:

`Mặc theo cách của riêng bạn — Thử đồ ảo AI`

This helps reveal clipping, spacing, font fallback, and line-height problems that may not appear with English-only text.

---

## 9. Responsive UX Rules

Every meaningful visual change must be considered at minimum at:

- desktop wide;
- desktop/laptop;
- tablet/narrow width;
- mobile portrait.

Do not assume a desktop CSS fix is safe on mobile.

### Check specifically

- navigation wrapping/overflow;
- hero height;
- image cropping;
- heading wrapping;
- buttons and touch targets;
- horizontal scrolling;
- fixed/sticky elements;
- overlays covering content;
- viewport-height sections;
- spacing between sections.

Never use `overflow: hidden` merely to conceal a layout bug without diagnosing the cause.

---

## 10. Homepage Protection Rules

The homepage is a composed editorial experience. Treat each section as an independent visual module.

Current continuity must be preserved:

`Hero → Manifesto → AI Studio → Collection → Experience`

When changing one section:

- do not alter another section's background unintentionally;
- do not reuse generic selectors that can affect neighboring sections;
- do not change global typography to fix one heading;
- do not change the page height/overflow model without checking the full page;
- verify the transition into and out of the edited section.

The existing label:

`AI TRY-ON (BETA)`

must remain exactly as written unless explicitly requested otherwise.

---

## 11. Assets and Vercel Safety

A local asset rendering successfully is not enough.

For an important asset:

1. confirm it is committed to the intended Git branch;
2. confirm the path is valid from `public/`;
3. confirm Vercel built the intended commit;
4. check browser Network/Console if the asset does not render;
5. distinguish build success from visual/runtime verification.

Typical failure layers:

```text
Wrong path
→ asset not found
→ CSS/DOM fallback
→ background disappears
```

or:

```text
Asset exists
→ CSS cascade hides it
→ z-index/overlay covers it
→ image appears missing
```

Do not immediately regenerate or replace an asset before checking these layers.

---

## 12. Safe Change Workflow

Use this workflow for CSS/UX/UI changes:

### A. Problem

State exactly what is broken or requested.

### B. Inspect

Find:

- route;
- component;
- stylesheet;
- imports;
- existing selectors;
- assets;
- responsive rules.

### C. Diagnose

Classify the cause as one or more of:

- CSS cascade;
- selector scope;
- stacking/z-index;
- asset path;
- DOM structure;
- typography;
- responsive rule;
- missing font;
- deployment/runtime issue.

### D. Minimal Change

Change the smallest possible number of files and selectors.

### E. Regression Check

Check the edited section plus adjacent sections.

### F. Responsive Check

Check desktop and mobile behavior.

### G. Deployment Check

Confirm the intended commit and Vercel build.

### H. Runtime/Visual Check

If possible, verify the actual deployed page. A successful build alone is not visual verification.

---

## 13. Pre-Commit CSS Checklist

Before committing a visual change:

- [ ] I identified the exact route and section.
- [ ] I searched for existing selectors before adding new ones.
- [ ] I checked stylesheet import order.
- [ ] I avoided unnecessary global selectors.
- [ ] I did not create duplicate components or competing stylesheets without a reason.
- [ ] Important background assets use a verified repository path.
- [ ] No asset references itself.
- [ ] Background and content have an explicit stacking order when needed.
- [ ] `::before` / `::after` do not accidentally cover content.
- [ ] Typography remains readable.
- [ ] Vietnamese text/diacritics render correctly where relevant.
- [ ] Image crops preserve the intended focal subjects.
- [ ] Desktop layout remains intact.
- [ ] Mobile layout remains intact.
- [ ] Adjacent homepage sections remain intact.
- [ ] No unrelated route was intentionally or unintentionally changed.

---

## 14. Rules Learned From Previous Homepage Regression

The following are project-specific lessons and must not be repeated:

### Lesson 1 — Do not assume a missing background is only a CSS problem

Check asset existence, browser path, DOM, CSS cascade, and stacking order before replacing the implementation.

### Lesson 2 — Do not use a recursive SVG workaround

A wrapper SVG must contain the actual image data or point to a different valid asset. It must never point back to itself.

### Lesson 3 — Use the real uploaded asset when available

Once the correct image exists in `public/images`, use its stable browser path instead of continuing to depend on an external Builder/CDN URL.

### Lesson 4 — Make important background layers explicit

For a text-over-image editorial section, an explicit background `<img>` layer plus overlay and content z-index is easier to reason about than a complex stack of background images, blend modes, and pseudo-elements.

### Lesson 5 — Typography must be tested visually

A mathematically valid CSS value can still produce poor UX. Large headings with aggressive negative tracking and compressed line-height must be checked at real viewport sizes.

### Lesson 6 — Do not fix one section with global CSS

A homepage regression can happen when a local visual problem is solved by changing a global heading, image, or container rule.

### Lesson 7 — Remove duplicate imports

A stylesheet imported twice can make debugging the cascade unnecessarily difficult. Each project stylesheet should have a clear import owner.

---

## 15. Definition of Done for CSS/UI

A CSS/UI change is complete only when:

`Correct visual fix + scoped CSS + preserved existing UX/UI + responsive check + deployment/runtime verification`

A commit or successful Vercel build alone does not prove that the visual change is correct.
