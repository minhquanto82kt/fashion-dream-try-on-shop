-- Restore browser RPC permissions required by the /admin login flow.
-- Keep the functions SECURITY DEFINER and do not grant EXECUTE to anon.
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin_user() to authenticated;
