-- Which bank / provider an account belongs to, as a short id from the app's
-- built-in list (e.g. 'maybank', 'tng', 'asnb'). The list and the logos live
-- in the app code (src/lib/providers.ts, public/providers/). Null = custom
-- name typed by the user in `institution`. Safe to run more than once.

alter table public.accounts
  add column if not exists provider text
  check (provider is null or provider ~ '^[a-z0-9-]{1,40}$');

-- Expose the new column through the balances view (added at the end, which
-- CREATE OR REPLACE VIEW allows; existing grants are kept).
create or replace view public.account_balances
with (security_invoker = true) as
select
  a.id,
  a.user_id,
  a.name,
  a.institution,
  a.type,
  a.opening_balance,
  a.currency,
  a.archived,
  a.created_at,
  a.opening_balance + coalesce(sum(m.delta), 0) as balance,
  a.provider
from public.accounts a
left join (
  select account_id, case kind
           when 'income'     then amount
           when 'expense'    then -amount
           when 'transfer'   then -amount
           when 'adjustment' then amount
         end as delta
  from public.transactions
  union all
  select to_account_id, amount
  from public.transactions
  where kind = 'transfer'
) m on m.account_id = a.id
group by a.id;

grant select on public.account_balances to authenticated;
