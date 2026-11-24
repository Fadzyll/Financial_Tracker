-- Backfill for users who signed up BEFORE the init migration was applied
-- (the on_auth_user_created trigger did not exist yet, so they have no
-- profile and no default categories). Safe to run more than once.

insert into public.profiles (id, display_name)
select u.id, left(u.raw_user_meta_data ->> 'display_name', 60)
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

insert into public.categories (user_id, key, name, kind)
select u.id, d.key, d.name, d.kind::public.category_kind
from auth.users u
cross join (values
  ('salary',        'Salary',          'income'),
  ('business',      'Business',        'income'),
  ('dividend',      'Dividend',        'income'),
  ('gift',          'Gift',            'income'),
  ('other_income',  'Other income',    'income'),
  ('food',          'Food & drinks',   'expense'),
  ('groceries',     'Groceries',       'expense'),
  ('transport',     'Transport',       'expense'),
  ('bills',         'Bills',           'expense'),
  ('housing',       'Rent / housing',  'expense'),
  ('shopping',      'Shopping',        'expense'),
  ('health',        'Health',          'expense'),
  ('education',     'Education',       'expense'),
  ('family',        'Family',          'expense'),
  ('charity',       'Zakat / charity', 'expense'),
  ('entertainment', 'Entertainment',   'expense'),
  ('other_expense', 'Other expense',   'expense')
) as d(key, name, kind)
where not exists (select 1 from public.categories c where c.user_id = u.id);
