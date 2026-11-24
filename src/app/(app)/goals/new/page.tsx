import { PageHeader } from "@/components/page-header";
import { getAccounts } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { createGoal } from "../actions";
import { GoalForm } from "../goal-form";

export default async function NewGoalPage() {
  const { t } = await getI18n();
  const accounts = await getAccounts();
  return (
    <>
      <PageHeader title={t.goals.add} backHref="/goals" />
      <GoalForm action={createGoal} accounts={accounts} />
    </>
  );
}
