import Link from "next/link";
import { Plus } from "lucide-react";
import { AccountIcon } from "@/components/account-icon";
import { PageHeader } from "@/components/page-header";
import { ButtonLink, Card } from "@/components/ui";
import { getAccounts } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import type { AccountWithBalance } from "@/lib/types";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const { t, locale } = await getI18n();
  const showArchived = (await searchParams).archived === "1";
  const accounts = await getAccounts({ includeArchived: true });
  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);
  const total = active.reduce((sum, a) => sum + a.balance, 0);

  return (
    <>
      <PageHeader
        title={t.accounts.title}
        action={
          <ButtonLink href="/accounts/new" className="px-3">
            <Plus className="size-4" /> <span className="hidden sm:inline">{t.accounts.add}</span>
          </ButtonLink>
        }
      />

      {active.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-muted">{t.accounts.empty}</p>
          <ButtonLink href="/accounts/new" className="mt-4">
            <Plus className="size-4" /> {t.accounts.add}
          </ButtonLink>
        </Card>
      ) : (
        <>
          <Card className="mb-4 flex items-baseline justify-between">
            <span className="text-sm text-muted">{t.dashboard.totalSavings}</span>
            <span className="tabular text-xl font-bold">{formatMoney(total, locale)}</span>
          </Card>
          <AccountList accounts={active} t={t} locale={locale} />
        </>
      )}

      {archived.length > 0 && (
        <div className="mt-6">
          <Link
            href={showArchived ? "/accounts" : "/accounts?archived=1"}
            className="text-sm font-medium text-muted hover:text-text"
          >
            {t.accounts.showArchived} ({archived.length})
          </Link>
          {showArchived && (
            <div className="mt-3 opacity-70">
              <AccountList accounts={archived} t={t} locale={locale} />
            </div>
          )}
        </div>
      )}
    </>
  );

}

function AccountList({
  accounts,
  t,
  locale,
}: {
  accounts: AccountWithBalance[];
  t: Dictionary;
  locale: Locale;
}) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {accounts.map((a) => (
        <li key={a.id}>
          <Link href={`/accounts/${a.id}`} className="flex items-center gap-3 p-4 hover:bg-surface-2">
            <AccountIcon type={a.type} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{a.name}</p>
              <p className="truncate text-xs text-muted">
                {t.accountTypes[a.type]}
                {a.institution ? ` · ${a.institution}` : ""}
              </p>
            </div>
            <span className="tabular font-semibold">{formatMoney(a.balance, locale)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
