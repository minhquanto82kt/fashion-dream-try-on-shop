# WEARO Color System

WEARO uses five brand colors as the single source of truth:

| Token | HEX | Role |
| --- | --- | --- |
| `blue` | `#54728C` | Foundation |
| `blueLight` | `#7794A6` | Supporting blue |
| `peach` | `#F2CEAE` | Warm light |
| `beige` | `#D9BBA9` | Neutral warm |
| `coral` | `#F2AD94` | Accent |

## Pairing rule

The system evaluates every ordered text/background pair: `5 × 5 = 25` combinations. The five identical pairs are rejected, leaving 20 candidate pairs.

Contrast categories:

- `AA_TEXT`: `>= 4.5` — suitable for normal functional text.
- `DISPLAY`: `>= 3.0` and `< 4.5` — suitable for large/display typography.
- `EDITORIAL_LOW`: `>= 2.0` and `< 3.0` — allowed only for intentional editorial/display use; the system may apply the soft text shadow.
- `RESTRICTED`: `< 2.0` — do not use for text. Shadow is never used as an accessibility workaround.

The canonical calculations live in `src/lib/wearo-color-system.ts`. CSS pair tokens live in `src/palette.css`.

## Developer workflow

Use semantic pair classes instead of hard-coded brand HEX values when a specific text/background combination is intentional:

```html
<span class="wearo-pair-coral-on-blue">RIÊNG BẠN</span>
```

For the current homepage hero, the coral accent is represented by the `coral-on-blue` system pair. The brand color remains `#F2AD94`; the pair system controls the approved presentation.

## Audit

Run locally:

```bash
node --experimental-strip-types scripts/audit-wearo-colors.ts
```

The same audit runs automatically in GitHub Actions. It verifies the five-color matrix, the 25/5/20 counts, contrast classification, and the rule that only `EDITORIAL_LOW` pairs receive automatic shadow treatment.

Do not add another palette file. Extend the central color system instead.
