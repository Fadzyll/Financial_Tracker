import Link from "next/link";
import { Plus } from "lucide-react";
import { AccountIcon } from "@/components/account-icon";
import { GoalCard } from "@/components/goal-card";
import { TransactionList } from "@/components/transaction-list";
import { ButtonLink, Card } from "@/components/ui";
import { getAccounts, getCategories, getGoals, getTransactions, goalSaved, summarize } from "@/lib/data";
import { currentMonth, formatMonth } from "@/lib/dates";
import { fmt } from "@/lib/i18n/dictionaries";
import { getI18n } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import { requireUser } from "@/lib/supabase/server";
import { ACCOUNT_TYPES } from "@/lib/types";

export default async function DashboardPage() {
  const { t, locale } = await getI18n();
  const { supabase, userId } = await requireUser();
  const month = currentMonth();

  const [profile, allAccounts, categories, goals, monthTxns, recent] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    getAccounts({ includeArchived: true }),
    getCategories(),
    getGoals(),
    getTransactions({ month }),
    getTransactions({ limit: 5 }),
  ]);

  const accounts = allAccounts.filter((a) => !a.archived);
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  const { income, expense, net } = summarize(monthTxns);
  const name = profile.data?.display_name;

  const byType = ACCOUNT_TYPES.map((type) => ({
    type,
    amount: accounts.filter((a) => a.type === type).reduce((s, a) => s + a.balance, 0),
    count: accounts.filter((a) => a.type === type).length,
  })).filter((x) => x.count > 0);
  const positiveTotal = byType.reduce((s, x) => s + Math.max(x.amount, 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">
        {name ? fmt(t.dashboard.hello, { name }) : t.dashboard.helloAnon}
      </h1>

      {/* Total savings */}
      <section className="rounded-3xl bg-brand p-5 text-on-brand sm:p-6">
        <p className="text-sm font-medium opacity-85">{t.dashboard.totalSavings}</p>
        <p className="tabular mt-1 text-3xl font-bold sm:text-4xl">{formatMoney(total, locale)}</p>
        <p className="mt-1 text-sm opacity-85">
          {fmt(t.dashboard.acrossAccounts, { count: accounts.length })}
        </p>
      </section>

      {accounts.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-muted">{t.dashboard.getStarted}</p>
          <ButtonLink href="/accounts/new" className="mt-4">
            <Plus className="size-4" /> {t.accounts.add}
          </ButtonLink>
        </Card>
      ) : (
        <>
          {/* This month */}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted">
              {t.dashboard.thisMonth} · {formatMonth(month, locale)}
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Card className="p-3 sm:p-4">
                <p className="text-xs text-muted">{t.dashboard.moneyIn}</p>
                <p className="tabular mt-1 text-sm font-semibold text-income sm:text-lg">
                  {formatMoney(income, locale)}
                </p>
              </Card>
              <Card className="p-3 sm:p-4">
                <p className="text-xs text-muted">{t.dashboard.moneyOut}</p>
                <p className="tabular mt-1 text-sm font-semibold text-expense sm:text-lg">
                  {formatMoney(expense, locale)}
                </p>
              </Card>
              <Card className="p-3 sm:p-4">
                <p className="text-xs text-muted">{t.dashboard.net}</p>
                <p className="tabular mt-1 text-sm font-semibold sm:text-lg">
                  {formatMoney(net, locale, { signed: true })}
                </p>
              </Card>
            </div>
          </section>

          {/* Savings by type + accounts */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-muted">{t.dashboard.byType}</h2>
              <Link href="/accounts" className="text-sm font-semibold text-brand">
                {t.common.viewAll}
              </Link>
            </div>
            <Card>
              {positiveTotal > 0 && (
                <div className="mb-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
                  {byType
                    .filter((x) => x.amount > 0)
                    .map((x, i) => (
                      <div
                        key={x.type}
                        className="h-full bg-brand"
                        style={{
                          width: `${(x.amount / positiveTotal) * 100}%`,
                          opacity: 1 - i * (0.6 / Math.max(byType.length, 1)),
                        }}
                        title={t.accountTypes[x.type]}
                      />
                    ))}
                </div>
              )}
              <ul className="space-y-3">
                {byType.map((x) => (
                  <li key={x.type} className="flex items-center gap-3">
                    <AccountIcon type={x.type} className="size-9" />
                    <span className="flex-1 text-sm font-medium">{t.accountTypes[x.type]}</span>
                    <span className="tabular text-sm font-semibold">{formatMoney(x.amount, locale)}</span>
                    {positiveTotal > 0 && (
                      <span className="tabular w-11 text-right text-xs text-muted">
                        {Math.round((Math.max(x.amount, 0) / positiveTotal) * 100)}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Goals */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-muted">{t.goals.title}</h2>
              <Link href={goals.length ? "/goals" : "/goals/new"} className="text-sm font-semibold text-brand">
                {goals.length ? t.common.viewAll : t.goals.add}
              </Link>
            </div>
            {goals.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">
                {t.goals.empty}
              </p>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    saved={goalSaved(goal, allAccounts)}
                    t={t}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-muted">{t.dashboard.recent}</h2>
              <Link href="/transactions" className="text-sm font-semibold text-brand">
                {t.common.viewAll}
              </Link>
            </div>
            <TransactionList
              transactions={recent}
              accounts={allAccounts}
              categories={categories}
              t={t}
              locale={locale}
            />
          </section>
        </>
      )}
    </div>
  );
}
