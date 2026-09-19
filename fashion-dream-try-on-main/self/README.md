# Self-Operations

`self/` is reserved for bounded self-observation and self-maintenance. It does not mean local development.

## Allowed directions

- self-observe: collect health/status information
- self-check: validate known invariants
- self-heal: retry or recover only explicitly safe transient failures
- self-maintain: clean only disposable artifacts/cache
- self-sync: reconcile approved configuration/data sources
- self-backup: create recoverable backups before approved maintenance

## Safety boundary

Self-automation must be idempotent where practical, observable, logged, and reversible. It must never silently:

- drop or truncate production tables;
- disable RLS or authentication;
- change payment/order status;
- delete customer/order/payment history;
- expose secrets;
- deploy production code without an explicit deployment action.

Any future self-healing routine must document its trigger, allowed mutation, rollback path, and failure behavior before implementation.
