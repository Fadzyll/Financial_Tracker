import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ProgressBar } from "@/components/ui";
import { fmt, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatDate, monthsUntil } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Goal } from "@/lib/types";

export function GoalCard({
  goal,
  saved,
  t,
  locale,
}: {
  goal: Goal;
  saved: number;
  t: Dictionary;
  locale: Locale;
}) {
  const pct = (Math.max(saved, 0) / goal.target_amount) * 100;
  const remaining = Math.max(goal.target_amount - saved, 0);
  const reached = remaining === 0;
  const months = goal.target_date ? monthsUntil(goal.target_date) : null;

  let detail: string | null = null;
  if (!reached && goal.target_date) {
    detail =
      months === 0
        ? t.goals.overdue
        : fmt(t.goals.perMonth, {
            amount: formatMoney(Math.ceil(remaining / (months ?? 1)), locale),
            date: formatDate(goal.target_date, locale),
          });
  }

  return (
    <Link
      href={`/goals/${goal.id}/edit`}
      className="block rounded-2xl border border-border bg-surface p-4 hover:bg-surface-2"
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="truncate font-semibold">{goal.name}</h3>
        <span className="text-sm font-semibold text-brand">{Math.min(100, Math.floor(pct))}%</span>
      </div>
      <ProgressBar value={pct} />
      <div className="mt-2 flex flex-col gap-0.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <span className="tabular">
          {formatMoney(saved, locale)}{" "}
          <span className="text-muted">/ {formatMoney(goal.target_amount, locale)}</span>
        </span>
        {reached ? (
          <span className="inline-flex items-center gap-1 font-semibold text-income">
            <CheckCircle2 className="size-4" /> {t.goals.reached}
          </span>
        ) : (
          <span className="tabular text-muted sm:text-right">
            {fmt(t.goals.remaining, { amount: formatMoney(remaining, locale) })}
          </span>
        )}
      </div>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </Link>
  );
}
