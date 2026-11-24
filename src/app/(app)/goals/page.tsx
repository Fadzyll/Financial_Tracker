import { Plus } from "lucide-react";
import { GoalCard } from "@/components/goal-card";
import { PageHeader } from "@/components/page-header";
import { ButtonLink, Card } from "@/components/ui";
import { getAccounts, getGoals, goalSaved } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export default async function GoalsPage() {
  const { t, locale } = await getI18n();
  const [goals, accounts] = await Promise.all([getGoals(), getAccounts({ includeArchived: true })]);

  return (
    <>
      <PageHeader
        title={t.goals.title}
        action={
          <ButtonLink href="/goals/new" className="px-3">
            <Plus className="size-4" /> <span className="hidden sm:inline">{t.goals.add}</span>
          </ButtonLink>
        }
      />
      {goals.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-muted">{t.goals.empty}</p>
          <ButtonLink href="/goals/new" className="mt-4">
            <Plus className="size-4" /> {t.goals.add}
          </ButtonLink>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} saved={goalSaved(goal, accounts)} t={t} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
