import { PageHeader } from "@/components/page-header";
import { ButtonLink, Card } from "@/components/ui";
import { getAccounts, getCategories } from "@/lib/data";
import { todayISO, yesterdayISO } from "@/lib/dates";
import { getI18n } from "@/lib/i18n/server";
import { safeNextPath } from "@/lib/next-path";
import type { TransactionKind } from "@/lib/types";
import { isUuid } from "@/lib/validation";
import { createTransaction } from "../actions";
import { TransactionForm } from "../transaction-form";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; account?: string; from?: string }>;
}) {
  const { t } = await getI18n();
  const sp = await searchParams;
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);
  const explicitKind = sp.kind === "income" || sp.kind === "transfer" || sp.kind === "expense";
  const kind: TransactionKind = explicitKind ? (sp.kind as TransactionKind) : "expense";
  const accountId = isUuid(sp.account) ? sp.account : undefined;
  // Go back to where the user came from after saving / cancelling.
  const backHref = accountId ? `/accounts/${accountId}` : safeNextPath(sp.from);

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
          defaults={{ kind, accountId, date: todayISO(), explicit: explicitKind || Boolean(accountId) }}
          cancelHref={backHref}
          next={backHref}
          today={todayISO()}
          yesterday={yesterdayISO()}
        />
      )}
    </>
  );
}
