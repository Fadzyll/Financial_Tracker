-- Financial Tracker — initial schema
--
-- Privacy rule: this database never stores account numbers, card numbers or
-- IC numbers. An "account" is only a label (e.g. "Maybank Savings", "ASB").
--
-- Money is stored as whole sen (bigint): RM 12.34 = 1234. No floating point.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.account_type as enum (
  'bank',        -- Maybank, CIMB, Bank Islam, ...
  'ewallet',     -- Touch 'n Go, GrabPay, ...
  'cash',        -- cash in wallet
  'investment',  -- ASB, unit trust, stocks, Tabung Haji, ...
  'gold',        -- gold, tracked in RM value
  'retirement',  -- EPF / KWSP, PRS
  'other'
);

create type public.category_kind as enum ('income', 'expense');

create type public.transaction_kind as enum (
  'income',     -- money comes in (amount > 0)
  'expense',    -- money goes out (amount > 0)
  'transfer',   -- move between two of the user's accounts (amount > 0)
  'adjustment'  -- value change without cash flow, e.g. gold price (signed)
);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Accounts (where money sits)
-- ---------------------------------------------------------------------------
create table public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name            text not null check (char_length(name) between 1 and 60),
  institution     text check (char_length(institution) <= 60),
  type            public.account_type not null,
  opening_balance bigint not null default 0,
  currency        char(3) not null default 'MYR',
  archived        boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (id, user_id)
);
create index accounts_user_idx on public.accounts (user_id);

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Built-in categories carry a key so the UI can translate them (EN/BM).
  -- Custom categories have key = null and show `name` as typed.
  key        text,
  name       text not null check (char_length(name) between 1 and 40),
  kind       public.category_kind not null,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, kind, name)
);
create index categories_user_idx on public.categories (user_id);

-- ---------------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------------
create table public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind          public.transaction_kind not null,
  account_id    uuid not null,
  to_account_id uuid,
  category_id   uuid,
  amount        bigint not null,
  occurred_on   date not null default current_date,
  note          text check (char_length(note) <= 200),
  created_at    timestamptz not null default now(),

  -- Composite FKs make sure every referenced row belongs to the same user.
  foreign key (account_id, user_id)    references public.accounts (id, user_id) on delete cascade,
  foreign key (to_account_id, user_id) references public.accounts (id, user_id) on delete cascade,
  foreign key (category_id, user_id)   references public.categories (id, user_id) on delete set null (category_id),

  constraint transfer_has_destination check ((kind = 'transfer') = (to_account_id is not null)),
  constraint transfer_not_to_self     check (to_account_id is null or to_account_id <> account_id),
  constraint amount_sign check (
    (kind = 'adjustment' and amount <> 0) or (kind <> 'adjustment' and amount > 0)
  ),
  constraint category_only_for_flows check (category_id is null or kind in ('income', 'expense'))
);
create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
create index transactions_account_idx   on public.transactions (account_id);
create index transactions_to_account_idx on public.transactions (to_account_id) where to_account_id is not null;

-- ---------------------------------------------------------------------------
-- Goals (marriage, kids, travel, emergency fund, ...)
-- ---------------------------------------------------------------------------
create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 60),
  target_amount bigint not null check (target_amount > 0),
  target_date   date,
  -- 'all'      = progress uses total savings across every active account
  -- 'accounts' = progress uses only the accounts linked in goal_accounts
  scope         text not null default 'accounts' check (scope in ('all', 'accounts')),
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (id, user_id)
);
create index goals_user_idx on public.goals (user_id);

create table public.goal_accounts (
  goal_id    uuid not null,
  account_id uuid not null,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (goal_id, account_id),
  foreign key (goal_id, user_id)    references public.goals (id, user_id) on delete cascade,
  foreign key (account_id, user_id) references public.accounts (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Balances are calculated, never typed in:
--   opening + income - expense - transfers out + transfers in + adjustments
-- security_invoker = true makes the view respect the caller's RLS.
-- ---------------------------------------------------------------------------
create view public.account_balances
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
  a.opening_balance + coalesce(sum(m.delta), 0) as balance
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

-- ---------------------------------------------------------------------------
-- Row Level Security: each user sees and changes only their own rows.
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.accounts      enable row level security;
alter table public.categories    enable row level security;
alter table public.transactions  enable row level security;
alter table public.goals         enable row level security;
alter table public.goal_accounts enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own accounts" on public.accounts
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own categories" on public.categories
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own transactions" on public.transactions
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own goals" on public.goals
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own goal accounts" on public.goal_accounts
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Nothing is readable without logging in.
revoke all on public.profiles, public.accounts, public.categories,
              public.transactions, public.goals, public.goal_accounts,
              public.account_balances from anon;

-- ---------------------------------------------------------------------------
-- New user setup: profile + default categories
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(new.raw_user_meta_data ->> 'display_name', 60));

  insert into public.categories (user_id, key, name, kind)
  values
    (new.id, 'salary',        'Salary',          'income'),
    (new.id, 'business',      'Business',        'income'),
    (new.id, 'dividend',      'Dividend',        'income'),
    (new.id, 'gift',          'Gift',            'income'),
    (new.id, 'other_income',  'Other income',    'income'),
    (new.id, 'food',          'Food & drinks',   'expense'),
    (new.id, 'groceries',     'Groceries',       'expense'),
    (new.id, 'transport',     'Transport',       'expense'),
    (new.id, 'bills',         'Bills',           'expense'),
    (new.id, 'housing',       'Rent / housing',  'expense'),
    (new.id, 'shopping',      'Shopping',        'expense'),
    (new.id, 'health',        'Health',          'expense'),
    (new.id, 'education',     'Education',       'expense'),
    (new.id, 'family',        'Family',          'expense'),
    (new.id, 'charity',       'Zakat / charity', 'expense'),
    (new.id, 'entertainment', 'Entertainment',   'expense'),
    (new.id, 'other_expense', 'Other expense',   'expense');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
