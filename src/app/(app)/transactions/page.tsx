import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TransactionList } from "@/components/transaction-list";
import { ButtonLink, Card } from "@/components/ui";
import { getAccounts, getCategories, getTransactions, summarize } from "@/lib/data";
import { currentMonth, formatMonth, isValidMonth, shiftMonth } from "@/lib/dates";
import { getI18n } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import { isUuid } from "@/lib/validation";
import { AccountFilter } from "./filters";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; account?: string }>;
}) {
  const { t, locale } = await getI18n();
  const sp = await searchParams;
  const month = isValidMonth(sp.month) ? sp.month : currentMonth();
  const accountId = isUuid(sp.account) ? sp.account : undefined;

  const [accounts, categories, transactions] = await Promise.all([
    getAccounts({ includeArchived: true }),
    getCategories(),
    getTransactions({ month, accountId }),
  ]);
  const { income, expense, net } = summarize(transactions);

  const link = (m: string) => {
    const params = new URLSearchParams({ month: m });
    if (accountId) params.set("account", accountId);
    return `/transactions?${params}`;
  };
  const isCurrent = month === currentMonth();

  return (
    <>
      <PageHeader
        title={t.transactions.title}
        action={
          <ButtonLink href="/transactions/new" className="px-3">
            <Plus className="size-4" /> <span className="hidden sm:inline">{t.transactions.add}</span>
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 sm:flex-1">
          <Link
            href={link(shiftMonth(month, -1))}
            aria-label="Previous month"
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <span className="flex-1 text-center text-sm font-semibold">{formatMonth(month, locale)}</span>
          {isCurrent ? (
            <span className="size-9" />
          ) : (
            <Link
              href={link(shiftMonth(month, 1))}
              aria-label="Next month"
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
            >
              <ChevronRight className="size-5" />
            </Link>
          )}
        </div>
        <div className="sm:w-56">
          <AccountFilter accounts={accounts} month={month} value={accountId} />
        </div>
      </div>

      <Card className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted">{t.dashboard.moneyIn}</p>
          <p className="tabular text-sm font-semibold text-income sm:text-base">{formatMoney(income, locale)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{t.dashboard.moneyOut}</p>
          <p className="tabular text-sm font-semibold text-expense sm:text-base">{formatMoney(expense, locale)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{t.dashboard.net}</p>
          <p className="tabular text-sm font-semibold sm:text-base">{formatMoney(net, locale, { signed: true })}</p>
        </div>
      </Card>

      <TransactionList
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        t={t}
        locale={locale}
        accountId={accountId}
      />
    </>
  );
}
