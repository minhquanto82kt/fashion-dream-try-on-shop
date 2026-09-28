# Schema references

The SQL files in this directory are version-controlled snapshots of the current database architecture. They are reference material, not a replayable migration chain.

Each snapshot should keep the following concerns visible where applicable:

- table definitions
- primary/foreign keys
- uniqueness and check constraints
- indexes
- RLS enablement
- RLS policies
- grants where relevant
- triggers and functions
- storage policies when the feature owns storage behavior

## Naming

Use ordered names such as:

```text
001_core_products.sql
002_inventory_variants.sql
003_orders.sql
...
```

Do not reuse a number for a different database concern.

## Snapshot rule

When a live database change is made, update the corresponding reference only after the live result has been verified. If the live state and the snapshot disagree, document the mismatch instead of silently guessing which one is authoritative.

See `../contracts/data-model.md` for cross-entity invariants and `../migrations/README.md` for the migration policy.
