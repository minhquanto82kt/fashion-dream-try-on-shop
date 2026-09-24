# WEARO — Brand System Contract

## Brand architecture

- **WEARO**: public customer-facing fashion brand.
- **UpThink**: internal operating/control layer that manages how WEARO works.

Never merge these identities in the UI:

- Public storefront → WEARO.
- `/admin` → UpThink / WEARO Control System.

## Color hierarchy

### Primary

| Preview | HEX | Role | Name |
|---|---|---|---|
| ![54728C](https://img.shields.io/badge/%20-%2354728C-54728C?style=flat-square) | `#54728C` | Primary | slate blue |

### Secondary

| Preview | HEX | Role | Name |
|---|---|---|---|
| ![F2AD94](https://img.shields.io/badge/%20-%23F2AD94-F2AD94?style=flat-square) | `#F2AD94` | Secondary | coral peach / pink accent |

### Neutral

| Preview | HEX | Role | Name |
|---|---|---|---|
| ![FFFFFF](https://img.shields.io/badge/%20-%23FFFFFF-FFFFFF?style=flat-square) | `#FFFFFF` | Neutral | white |

### Supporting palette

| Preview | HEX | Role | Name |
|---|---|---|---|
| ![7794A6](https://img.shields.io/badge/%20-%237794A6-7794A6?style=flat-square) | `#7794A6` | Supporting | secondary blue tone |
| ![F2CEAE](https://img.shields.io/badge/%20-%23F2CEAE-F2CEAE?style=flat-square) | `#F2CEAE` | Supporting | warm peach |
| ![D9BBA9](https://img.shields.io/badge/%20-%23D9BBA9-D9BBA9?style=flat-square) | `#D9BBA9` | Supporting | dusty beige |

## UX rule

Blue should establish brand identity and primary actions. Pink should signal secondary actions, accents, active emphasis, badges and selected states. White should provide breathing room and content surfaces.

Avoid letting beige/peach or legacy yellow/orange become the dominant visual language.

## Header contract

All primary navigation items use the same typography, spacing, hover, focus and active-state behavior. `AI Studio` may have a compact `BETA` badge, but the badge must not change the alignment or click target of the navigation item.

## Logo

Use the approved WEARO logo asset for the public header rather than recreating the logo with text and an improvised monogram.
