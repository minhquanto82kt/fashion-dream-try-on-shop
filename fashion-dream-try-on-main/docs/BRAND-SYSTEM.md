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
| <span style="display:inline-block;width:24px;height:24px;background:#54728C;border:1px solid #888;border-radius:4px;"></span> | `#54728C` | Primary | slate blue |

### Secondary

| Preview | HEX | Role | Name |
|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;background:#F2AD94;border:1px solid #888;border-radius:4px;"></span> | `#F2AD94` | Secondary | coral peach / pink accent |

### Neutral

| Preview | HEX | Role | Name |
|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;background:#FFFFFF;border:1px solid #888;border-radius:4px;"></span> | `#FFFFFF` | Neutral | white |

### Supporting palette

| Preview | HEX | Role | Name |
|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;background:#7794A6;border:1px solid #888;border-radius:4px;"></span> | `#7794A6` | Supporting | secondary blue tone |
| <span style="display:inline-block;width:24px;height:24px;background:#F2CEAE;border:1px solid #888;border-radius:4px;"></span> | `#F2CEAE` | Supporting | warm peach |
| <span style="display:inline-block;width:24px;height:24px;background:#D9BBA9;border:1px solid #888;border-radius:4px;"></span> | `#D9BBA9` | Supporting | dusty beige |

## UX rule

Blue should establish brand identity and primary actions. Pink should signal secondary actions, accents, active emphasis, badges and selected states. White should provide breathing room and content surfaces.

Avoid letting beige/peach or legacy yellow/orange become the dominant visual language.

## Header contract

All primary navigation items use the same typography, spacing, hover, focus and active-state behavior. `AI Studio` may have a compact `BETA` badge, but the badge must not change the alignment or click target of the navigation item.

## Logo

Use the approved WEARO logo asset for the public header rather than recreating the logo with text and an improvised monogram.
