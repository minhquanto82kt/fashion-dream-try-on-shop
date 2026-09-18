drop policy if exists "Users can create their own try-on jobs" on public.try_on_jobs;
drop policy if exists "Users can update their own try-on jobs" on public.try_on_jobs;
revoke insert, update, delete on public.try_on_jobs from anon, authenticated;
