# WEARO Foundation Security Matrix

This is the review matrix for the eight-workstream foundation phase.

| Boundary | Identity source | Authorization | Database protection | Notes |
|---|---|---|---|---|
| Public catalogue | none | published/active filter | RLS | Never expose drafts |
| Customer order create | authenticated session or guest checkout contract | server validates allowed fields | RPC/RLS | Do not trust arbitrary user IDs |
| Customer order history | authenticated session | owner-only | RLS | Query by authenticated owner |
| Admin products | admin session | admin/staff permission | RLS | UI is not the boundary |
| Admin orders | admin session | orders.read / orders.update | RLS | Separate read/update permissions |
| Inventory | admin session | inventory.read / inventory.write | RLS | Stock mutation must be server controlled |
| Wishlist | authenticated session | owner-only | RLS | Never accept owner ID from client as authority |
| AI job/result | authenticated session where required | owner/job ownership | private storage + RLS | Keep original/result assets private |
| Payment callback | provider/server request | signature/secret verification | server-side update | Client redirect is not payment proof |
| Product images | admin session for writes | products.write | storage policies | Validate MIME and size |

## Role vocabulary

The application policy vocabulary is centralized in `src/lib/auth-policy.ts`:

- `customer`
- `staff`
- `manager`
- `admin`

Permissions are explicit rather than inferred from UI visibility.

## Review checklist

- [ ] Every server mutation resolves identity server-side.
- [ ] Every user-owned query has an ownership predicate or equivalent RLS policy.
- [ ] Every admin mutation has a server authorization check.
- [ ] Every sensitive table has RLS enabled.
- [ ] Every storage bucket has read/write policies appropriate to the asset.
- [ ] Payment webhooks verify authenticity before changing payment state.
- [ ] AI endpoints have request limits and upload validation.
- [ ] Secrets never appear in client bundles.
