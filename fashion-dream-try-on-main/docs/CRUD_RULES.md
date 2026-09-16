# CRUD Rules

## Purpose

Canonical rules for Create, Read, Update, and Delete behavior.

## Required Analysis

Before implementing a data feature, define:

`Entity → Create → Read → Update → Delete → Authorization → RLS → UI Refresh`

## CREATE

Identify:

- target table/entity;
- required fields;
- primary key generation;
- foreign keys;
- authenticated user/role;
- validation;
- server/client boundary;
- RLS INSERT policy;
- success response;
- UI refresh/refetch behavior.

## READ

Use the canonical source of truth.

Check:

- table and columns;
- selected fields;
- filters and ordering;
- pagination when applicable;
- authentication;
- RLS SELECT policy;
- loading, empty, and error states.

Do not silently replace live data with mock data.

## UPDATE

Use the stable primary key or canonical record ID.

Before updating:

- verify the record ID;
- verify allowed fields;
- verify authorization;
- verify current state when relevant;
- verify RLS UPDATE policy;
- verify database constraints;
- decide whether UI should refetch or update optimistically.

Never target records by display name when a stable ID exists.

## DELETE

Every delete must explicitly be classified as:

- hard delete;
- soft delete; or
- delete not allowed.

Destructive operations require appropriate confirmation and error handling.

Orders, payments, and transaction history should normally not be hard-deleted.

## Status Transitions

Do not let the UI invent invalid business states. Status changes must follow the existing domain rules and database constraints.

For payments:

`Pending → Verification → Paid/Failed`

Do not mark payment as paid because a user opened a QR code or clicked a payment button.

## CRUD Failure Debugging

Use:

`UI → Request → Server/API → Supabase Query → Auth/RLS → Constraint → Response → UI Refresh`

Fix the actual failing layer instead of adding unrelated workarounds.
