import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/ui";
import { getAccounts, getCategories, getTransaction } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { deleteTransaction, updateTransaction } from "../../actions";
import { TransactionForm } from "../../transaction-form";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getI18n();
  const [transaction, allAccounts, categories] = await Promise.all([
    getTransaction(id),
    getAccounts({ includeArchived: true }),
    getCategories(),
  ]);
  if (!transaction) notFound();

  // Active accounts, plus any archived account this transaction already uses.
  const used = new Set([transaction.account_id, transaction.to_account_id]);
  const accounts = allAccounts.filter((a) => !a.archived || used.has(a.id));

  return (
    <>
      <PageHeader title={t.kinds[transaction.kind]} backHref="/transactions" />
      <TransactionForm
        action={updateTransaction.bind(null, id)}
        accounts={accounts}
        categories={categories}
        transaction={transaction}
        defaults={{ kind: transaction.kind, date: transaction.occurred_on }}
        cancelHref="/transactions"
      />
      <form action={deleteTransaction.bind(null, id)} className="mt-4">
        <SubmitButton variant="danger" className="w-full" confirmMessage={t.common.confirmDelete}>
          {t.common.delete}
        </SubmitButton>
      </form>
    </>
  );
}
