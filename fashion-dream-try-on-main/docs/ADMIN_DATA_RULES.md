# Admin Data Rules

## CRUDL contract

Admin data management follows:

**List → Create → Read → Update → Delete**

- **List** returns persisted records from the database and supports filtering/search where appropriate.
- **Create** validates input and creates a record with a stable database ID.
- **Read** loads a single record by ID.
- **Update** modifies the existing record by ID; explicit nullable fields must be distinguishable from omitted fields.
- **Delete** is explicit and confirmed for destructive catalog operations.

## Python role

FastAPI is the protected admin service layer for business validation, authorization and database operations. Supabase remains the source of truth. Frontend admin screens must not use the service-role key.

## Tags

`tags` is the canonical tag entity and `product_tags` is the product/tag relationship. Tag status supports `active` and `archived`. Archiving is preferred when historical reuse matters; hard delete is available as an explicit destructive action and removes the tag's product links first.

## Authorization

Admin endpoints require a valid Supabase access token and an entry in `public.admin_users`. The Python service uses its server-side Supabase service-role client only after that authorization check.
