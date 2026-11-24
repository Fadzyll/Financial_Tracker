# KiraDuit

*Kira duit masuk, duit keluar, dan berapa lagi tinggal.* — count your money in, money out, and what's left.

A personal money tracker (PWA) where you record your own **money in**, **money out** and **transfers**, see your **total savings** across banks, e-wallets and investments (ASB, gold, EPF…), and track **savings goals** (wedding, kids, travel…).

- Works on phone and laptop: installable as an app (Add to Home Screen)
- English / Bahasa Melayu toggle (English by default)
- Anyone can sign up; each user only ever sees their own data (Postgres row-level security)
- **No account numbers are stored.** An account is only a name like "Maybank Savings" or "ASB"

Stack: Next.js 16 (App Router, Server Actions) · Supabase (Postgres + Auth) · Tailwind CSS v4.

## How the numbers work

| Thing | Rule |
|---|---|
| Account balance | Calculated: opening balance + money in − money out ± transfers ± value updates |
| Total savings | Sum of all non-archived account balances |
| Transfer (e.g. Maybank → ASB) | Moves money between your accounts; **not** counted as spending |
| Value update (gold/ASB price change) | Enter the current value; the difference is recorded. Not counted as income or spending |
| Goal progress | Either *selected accounts* (e.g. ASB + Tabung Haji for a wedding) or *all accounts* (total savings) |

Money is stored as whole sen (`bigint`) to avoid rounding errors.

## Setup

### 1. Create a Supabase project
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run every file in `supabase/migrations/` **in filename order**
   (or, with the Supabase CLI: `npx supabase link` then `npx supabase db push`).
   When you pull new changes later, run any new migration files the same way.
3. In **Authentication → URL Configuration** set **Site URL** to your app URL and add
   `https://<your-domain>/auth/confirm` to **Redirect URLs**.
4. Recommended: in **Authentication → Email Templates → Confirm signup**, change the link to
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` so confirmation links
   work even when opened on a different device from the one used to sign up.

### Email templates (recommended)
Set up custom SMTP in Supabase (**Authentication → Emails → SMTP Settings**), then paste:
- `supabase/templates/confirm-signup.html` into **Confirm sign up**
- `supabase/templates/reset-password.html` into **Reset password**

Their links use `token_hash`, so they work on any device. In **Authentication → URL
Configuration**, add `https://<your-domain>/**` to **Redirect URLs**.

### 2. Run locally
```bash
cp .env.example .env.local   # fill in URL + anon/publishable key from Project Settings → API
npm install
npm run dev
```
Open http://localhost:3000.

To run Supabase fully locally instead (needs Docker): `npx supabase start`, then use the
printed API URL and publishable key in `.env.local`. Local sign-ups don't need email confirmation.

### 3. Deploy
Deploy to [Vercel](https://vercel.com) (import the repo, add the two `NEXT_PUBLIC_SUPABASE_*`
environment variables). HTTPS is required for the PWA install prompt.

## Tests

```bash
npm run test:unit          # chart maths, money parsing, safe redirects
npx supabase start         # local database (Docker), applies migrations
npm run build
SUPABASE_SECRET_KEY=<SECRET_KEY from `npx supabase status`> npm run test:e2e
```

The same checks run on GitHub for every push and pull request
(`.github/workflows/ci.yml`): typecheck, unit tests, build, then the browser
tests against a fresh local Supabase.

## Project layout

```
src/
  app/
    (auth)/          login, signup, auth actions
    (app)/           logged-in pages: dashboard, accounts, transactions, goals, settings
    auth/confirm/    email confirmation handler
    export/          CSV download
    manifest.ts      PWA manifest
  components/        UI building blocks (cards, forms, nav, lists)
  lib/
    i18n/            EN/BM dictionaries + locale cookie
    supabase/        server/browser clients, session refresh
    money.ts         RM parsing/formatting (sen)
    providers.ts     built-in list of Malaysian banks, e-wallets, investments
  proxy.ts           session refresh + login redirect (Next 16 "proxy", formerly middleware)
public/
  sw.js              service worker (caches static assets only, never financial pages)
  icons/             app icons (regenerate with `npm run icons`)
  providers/         optional bank/provider logos (see README inside)
supabase/migrations/ database schema, RLS policies, default categories
```

## Roadmap
- Monthly budgets per category
- Reports: spending by category chart, monthly trends, net worth over time
- Recurring transactions (salary, bills)
- Gold in grams × price (currently tracked in RM value)
