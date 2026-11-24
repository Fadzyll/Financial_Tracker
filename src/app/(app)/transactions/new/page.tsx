import { PageHeader } from "@/components/page-header";
import { ButtonLink, Card } from "@/components/ui";
import { getAccounts, getCategories } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { getI18n } from "@/lib/i18n/server";
import type { TransactionKind } from "@/lib/types";
import { isUuid } from "@/lib/validation";
import { createTransaction } from "../actions";
import { TransactionForm } from "../transaction-form";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; account?: string }>;
}) {
  const { t } = await getI18n();
  const sp = await searchParams;
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);
  const kind: TransactionKind = sp.kind === "income" || sp.kind === "transfer" ? sp.kind : "expense";
  const accountId = isUuid(sp.account) ? sp.account : undefined;
  const backHref = accountId ? `/accounts/${accountId}` : "/transactions";

  return (
    <>
      <PageHeader title={t.transactions.add} backHref={backHref} />
      {accounts.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-muted">{t.transactions.needAccount}</p>
          <ButtonLink href="/accounts/new" className="mt-4">
            {t.accounts.add}
          </ButtonLink>
        </Card>
      ) : (
        <TransactionForm
          action={createTransaction}
          accounts={accounts}
          categories={categories}
          defaults={{ kind, accountId, date: todayISO() }}
          cancelHref={backHref}
          next={accountId ? `/accounts/${accountId}` : undefined}
        />
      )}
    </>
  );
}
