# Foundation RLS / Authorization Matrix

This document is the security acceptance matrix for Phase 1. It describes the intended boundary; the actual SQL policies remain authoritative.

| Domain | Guest | Authenticated user | Staff/Manager/Admin |
|---|---|---|---|
| Published products | Read | Read | Read/write according to permission |
| Product variants/images | Read public data | Read public data | Manage according to product permissions |
| Own cart | Local/guest flow | Own data | No cross-user access by default |
| Create order | Allowed for checkout flow | Allowed | Allowed where operationally required |
| Own orders | No historical access without ownership identity | Read own | Operational access according to order permission |
| Other users' orders | Denied | Denied | Only authorized operational roles |
| Wishlist | Denied | Own rows only | No blanket cross-user access |
| AI jobs/results | Create only through validated server flow | Own jobs/results | Operational access according to AI permission |
| Inventory | Denied | Denied | Manage according to inventory permission |
| Customer records | Denied | Own profile only | Read/manage according to customer permission |
| Payment callbacks | Provider/server only | Denied | Denied from browser |

## Required invariants

1. `user_id`/ownership values are resolved from authenticated server identity whenever possible.
2. Browser-visible admin navigation is not a security control.
3. Service-level privileged Supabase credentials are server-only.
4. Payment success is established by verified server/provider evidence, not by client state.
5. Private AI images and generated results are not exposed through public storage merely for UI convenience.
6. Every new user-owned table must have an explicit ownership policy before it is used by production routes.

## Acceptance tests

- User A cannot read User B's order.
- User A cannot modify User B's wishlist or AI job.
- Non-admin users cannot invoke product/inventory/order-management mutations reserved for staff.
- A browser request cannot choose an arbitrary `user_id` to impersonate another account.
- Payment callback endpoints do not trust a client-provided `paid=true` flag.
