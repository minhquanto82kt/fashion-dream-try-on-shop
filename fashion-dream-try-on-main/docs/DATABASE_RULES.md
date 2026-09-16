# Database Rules

## Purpose

Rules for Supabase database changes and data access.

## Source of Truth

Supabase is the canonical source of truth for production database-backed data.

## Required Inspection Order

Before changing a data feature, inspect:

`Table → Column → Primary Key → Foreign Key → RLS → Query → Response`

## Schema Safety

- Do not create duplicate tables for an existing entity.
- Do not rename/drop columns without checking all consumers.
- Do not change schema merely to solve a frontend display issue.
- Preserve stable IDs and relationships.
- Use migrations or the project's existing schema-management approach for schema changes.

## RLS

- Keep RLS enabled where it is part of the security model.
- Never disable RLS as a debugging shortcut.
- Verify the policy for the exact operation: SELECT, INSERT, UPDATE, or DELETE.
- UI visibility is not a substitute for database authorization.

## Query Rules

Queries must:

- select only required fields when practical;
- use stable IDs for record targeting;
- respect relationships and constraints;
- handle loading, empty, and error states;
- preserve the canonical response shape expected by consumers.

## Production Data

Do not modify or delete production data as part of a code fix unless the action is explicitly required and appropriately confirmed.

Transaction history such as orders and payments should be preserved.

## Debugging

When a database-backed feature fails:

`UI → Request → Server/API → Supabase Query → Auth/RLS → Constraint → Response → UI Refresh`

Do not assume the database is at fault until the query, authorization, and response have been inspected.
