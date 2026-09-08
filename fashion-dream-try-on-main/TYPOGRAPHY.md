# FashionTry Typography System

## Four tiers

| Tier | Font | Usage |
|---|---|---|
| Display | Anton | Hero accents, strong headings, buttons, brand marks, prices, numeric emphasis |
| Editorial | Bodoni Moda | Fashion/editorial headlines and product titles |
| Body/UI | Space Grotesk | Vietnamese body copy, navigation, forms, descriptions, controls |
| Meta | Oswald | Eyebrows, labels, product metadata, technical HUD text |

## Rules

- No handwritten/script fonts.
- No decorative italics.
- Vietnamese text must use the system fonts above; do not introduce an unverified decorative font.
- Use `type-display`, `type-editorial`, `type-body`, and `type-meta` when a semantic typography class is needed.
- Existing FashionTry selectors are globally mapped to these tiers in `src/styles.css`, so route-level Tailwind text classes inherit the same system.
- `font-display` now maps to Anton and `font-sans` maps to Space Grotesk.
