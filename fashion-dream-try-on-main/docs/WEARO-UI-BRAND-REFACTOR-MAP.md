# WEARO UI / Brand Refactor Map

> Scope: `feature/product-admin`
> Brand reference: WEARO logo PNG + official 5-color palette supplied by the project owner.

## 1. Brand foundation

| File | Current state | Required direction | Impact | Logic |
|---|---|---|---|---|
| `src/palette.css` | Legacy UpThink palette and dark/streetwear visual tokens | WEARO palette: `#54728C`, `#7794A6`, `#F2CEAE`, `#D9BBA9`, `#F2AD94`; warm-light storefront | High | Keep |
| `src/lib/theme.ts` | Theme defaults still use old dark/orange values | Default theme must match WEARO while retaining Supabase theme workflow | High | Keep CRUD/workflow |
| `src/lib/branding.ts` | Already contains WEARO runtime branding, but retains legacy storage/event identifiers for compatibility | Keep runtime behavior; remove legacy visual selectors only when corresponding CSS/classes are migrated | Medium | Keep |
| `src/components/site-nav.tsx` | Public navigation is already partially WEARO-branded, but visual system still inherits legacy tokens | Use real WEARO logo asset, clean modern nav, casual/unisex information architecture | High | Keep navigation logic |
| `src/components/site-footer.tsx` | WEARO copy exists, but legacy class/domain/social identifiers remain | Rename visual classing to WEARO; keep only verified contact/social destinations | Medium | Keep |

## 2. Public routes

| File | Current issue | WEARO treatment | Impact | Logic |
|---|---|---|---|---|
| `src/routes/__root.tsx` | Global metadata still references old positioning | WEARO + modern casual/unisex positioning | Medium | Keep |
| `src/routes/index.tsx` | Homepage metadata/content still carries streetwear-heavy positioning | WEARO lifestyle fashion; AI is a service, not the brand identity | High | Keep; redesign later |
| `src/routes/shop.tsx` | Shop metadata says personalized streetwear | Modern everyday fashion; casual/unisex catalog | Medium | Keep |
| `src/routes/product.$id.tsx` | Product metadata/error copy references old brand | WEARO product language | Medium | Keep |
| `src/routes/cart.tsx` | Cart metadata/copy references old brand | WEARO commerce copy | Low | Keep |
| `src/routes/checkout.tsx` | Checkout metadata references old brand | WEARO commerce copy | Low | Keep |
| `src/routes/about.tsx` | About metadata references old brand | WEARO brand story and proposition | Medium | Keep |
| `src/routes/ai.tsx` | AI page is framed as an AI lab | Reframe as WEARO AI Try-On / Personal Stylist | High | Keep AI logic |

## 3. AI layer

| File | Current issue | WEARO treatment | Impact | Logic |
|---|---|---|---|---|
| `src/lib/ai.functions.ts` | Prompt contains UpThink + streetwear brand language | Replace with WEARO fashion principles: modern, casual, unisex, wearable, personal, contemporary | High | Keep |
| `src/routes/admin/ai-studio.tsx` | Admin metadata contains old brand | WEARO admin naming | Low | Keep |

## 4. Commerce/data layer

| Area | Direction |
|---|---|
| Product source of truth | Keep Supabase/database architecture unchanged |
| Product taxonomy | Gradually support `category`, `style`, `fit`, `occasion`, `collection`, `gender` |
| Gender model | Support `men`, `women`, `unisex`; do not force the storefront into separate male/female worlds |
| Cart/order/payment | No visual refactor should change CRUD/payment semantics |
| Admin | Keep functional/data-dense; do not turn admin into an editorial storefront |

## 5. WEARO visual rules

### Brand colors

- Primary: `#54728C`
- Secondary: `#7794A6`
- Warm light: `#F2CEAE`
- Neutral warm: `#D9BBA9`
- Accent: `#F2AD94`

Functional neutrals may use white, warm off-white, and near-black, but they are not additional brand colors.

### Visual ratio

- 40% modern
- 30% casual fashion
- 20% editorial/lifestyle
- 10% AI/technology

### Avoid

- neon/cyber visual language
- dark-tech storefront as the default
- excessive gradients/glow
- excessive glassmorphism
- AI-dashboard aesthetics on the customer storefront
- making streetwear the definition of WEARO

## 6. Execution order

1. Brand tokens / palette
2. Global metadata and brand naming
3. Navigation/footer visual system
4. Homepage
5. Product cards and product detail
6. Unisex catalog/filter semantics
7. AI Try-On / AI Stylist positioning and prompts
8. WEARO Saigon editorial section
9. Visual QA on desktop/mobile

## 7. Safety constraints

- Do not rewrite the framework.
- Do not alter Supabase CRUD/payment behavior during visual refactor.
- Do not expose secrets.
- Do not delete legacy compatibility identifiers until all consumers are migrated.
- Do not claim production success without build/deployment verification.
