-- Restore the authenticated RPC permission required by the existing admin login flow.
-- The function itself remains SECURITY DEFINER and is intentionally restricted to
-- authenticated users; its implementation checks auth.uid() against admin_users.
grant execute on function public.is_admin() to authenticated;
