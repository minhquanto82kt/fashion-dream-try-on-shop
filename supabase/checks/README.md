# Database checks

This directory contains read-only audit queries for the live or staging Supabase database.

## `001_security_integrity_audit.sql`

Checks the presence of core tables, RLS enablement, selected uniqueness/integrity constraints, admin authorization function presence, and critical order/payment RPC presence.

The audit is intentionally non-mutating. Run it from a privileged SQL editor/session and review the results together with the current `pg_policies` and `storage.objects` policies.

A `PASS` means the specific invariant checked by the query is present; it does not prove the complete database security model is correct.
