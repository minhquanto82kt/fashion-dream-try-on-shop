# UpThink Admin — Auth & RLS Runbook

## Symptom

`/admin` login succeeds in Supabase Auth but the application reports:

```text
permission denied for function is_admin
```

## Diagnosis order

```text
Browser
  ↓
Supabase Auth session
  ↓
RPC is_admin()
  ↓
PostgreSQL EXECUTE privilege
  ↓
admin_users / role check
  ↓
RLS policies
  ↓
Admin dashboard
```

## Expected authorization model

- Anonymous users: cannot execute admin authorization RPCs.
- Authenticated users: may execute the authorization RPC.
- The RPC itself determines whether the authenticated identity is an admin.
- Admin tables remain protected by RLS.
- Do not grant `service_role`-level access to browser clients.

## Verification SQL

Run with a trusted database/admin connection, not from the browser:

```sql
select has_function_privilege(
  'authenticated',
  'public.is_admin()'::regprocedure,
  'EXECUTE'
);
```

Expected result: `true`.

Then verify the admin record by the authenticated user's stable identity, not by trusting an email supplied by the client.

## Fix principle

If the error is an EXECUTE privilege error, grant the minimum required RPC permission through a versioned Supabase migration. Do not disable RLS or make the function callable by `anon`.

## Production checklist

- [ ] Auth session exists.
- [ ] `is_admin()` executes for `authenticated`.
- [ ] Admin identity exists in `admin_users`.
- [ ] RLS remains enabled.
- [ ] `/admin` loads after authorization.
- [ ] Anonymous access is still denied.
