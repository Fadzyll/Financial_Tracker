import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { AccountIcon } from "@/components/account-icon";
import { PageHeader } from "@/components/page-header";
import { TransactionList } from "@/components/transaction-list";
import { ButtonLink, Card, SubmitButton } from "@/components/ui";
import { getAccounts, getCategories, getTransactions } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import { isUuid } from "@/lib/validation";
import { deleteAccount, setAccountArchived, updateAccountValue } from "../actions";
import { UpdateValueForm } from "./update-value-form";

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { t, locale } = await getI18n();
  const [accounts, categories, transactions] = await Promise.all([
    getAccounts({ includeArchived: true }),
    getCategories(),
    getTransactions({ accountId: id, limit: 200 }),
  ]);
  const account = accounts.find((a) => a.id === id);
  if (!account) notFound();

  return (
    <>
      <PageHeader
        title={account.name}
        backHref="/accounts"
        action={
          <ButtonLink href={`/accounts/${id}/edit`} variant="secondary" className="px-3">
            <Pencil className="size-4" /> <span className="hidden sm:inline">{t.common.edit}</span>
          </ButtonLink>
        }
      />

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <AccountIcon type={account.type} provider={account.provider} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">
              {t.accountTypes[account.type]}
              {account.institution ? ` · ${account.institution}` : ""}
              {account.archived ? ` · ${t.accounts.archived}` : ""}
            </p>
            <p className="tabular text-2xl font-bold">{formatMoney(account.balance, locale)}</p>
          </div>
        </div>
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-brand">
            {t.accounts.updateValue}
          </summary>
          <UpdateValueForm
            action={updateAccountValue.bind(null, id)}
            currentBalance={account.balance}
          />
        </details>
      </Card>

      {!account.archived && (
        <ButtonLink href={`/transactions/new?account=${id}`} className="mb-6 w-full">
          <Plus className="size-4" /> {t.transactions.add}
        </ButtonLink>
      )}

      <h2 className="mb-3 text-lg font-semibold">{t.accounts.history}</h2>
      <TransactionList
              from={`/accounts/${id}`}
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        t={t}
        locale={locale}
        accountId={id}
      />

      <div className="mt-8 space-y-3 border-t border-border pt-6">
        <form action={setAccountArchived.bind(null, id, !account.archived)}>
          <SubmitButton variant="secondary" className="w-full">
            {account.archived ? t.common.unarchive : t.common.archive}
          </SubmitButton>
        </form>
        <form action={deleteAccount.bind(null, id)}>
          <SubmitButton
            variant="danger"
            className="w-full"
            confirmMessage={`${t.accounts.deleteWarning}\n\n${t.common.confirmDelete}`}
          >
            {t.common.delete}
          </SubmitButton>
        </form>
        <p className="text-xs text-muted">{t.accounts.deleteWarning}</p>
      </div>
    </>
  );
}
