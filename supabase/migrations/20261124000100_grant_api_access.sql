-- Explicitly allow logged-in users to reach the app tables through the API.
-- Needed on Supabase projects created without "automatically expose new
-- tables" — otherwise every query fails with "permission denied".
-- Row Level Security still limits each user to their own rows.

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.accounts,
  public.categories,
  public.transactions,
  public.goals,
  public.goal_accounts
to authenticated;

grant select on public.account_balances to authenticated;
