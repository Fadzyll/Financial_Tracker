import { PageHeader } from "@/components/page-header";
import { getI18n } from "@/lib/i18n/server";
import { AccountForm } from "../account-form";
import { createAccount } from "../actions";

export default async function NewAccountPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageHeader title={t.accounts.add} backHref="/accounts" />
      <AccountForm action={createAccount} cancelHref="/accounts" />
    </>
  );
}
