import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getAccounts } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { isUuid } from "@/lib/validation";
import { AccountForm } from "../../account-form";
import { updateAccount } from "../../actions";

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { t } = await getI18n();
  const account = (await getAccounts({ includeArchived: true })).find((a) => a.id === id);
  if (!account) notFound();
  return (
    <>
      <PageHeader title={t.accounts.edit} backHref={`/accounts/${id}`} />
      <AccountForm action={updateAccount.bind(null, id)} account={account} cancelHref={`/accounts/${id}`} />
    </>
  );
}
