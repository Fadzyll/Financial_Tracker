import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/ui";
import { getAccounts, getGoals } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { isUuid } from "@/lib/validation";
import { deleteGoal, updateGoal } from "../../actions";
import { GoalForm } from "../../goal-form";

export default async function EditGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { t } = await getI18n();
  const [goals, allAccounts] = await Promise.all([getGoals(), getAccounts({ includeArchived: true })]);
  const goal = goals.find((g) => g.id === id);
  if (!goal) notFound();
  const linked = new Set(goal.goal_accounts.map((g) => g.account_id));
  const accounts = allAccounts.filter((a) => !a.archived || linked.has(a.id));

  return (
    <>
      <PageHeader title={t.goals.edit} backHref="/goals" />
      <GoalForm action={updateGoal.bind(null, id)} accounts={accounts} goal={goal} />
      <form action={deleteGoal.bind(null, id)} className="mt-4">
        <SubmitButton variant="danger" className="w-full" confirmMessage={t.common.confirmDelete}>
          {t.common.delete}
        </SubmitButton>
      </form>
    </>
  );
}
