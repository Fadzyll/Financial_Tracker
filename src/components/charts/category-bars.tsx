import { ChartCard } from "./chart-kit";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/money";

/**
 * Horizontal bars, one hue (it is one series: spending), biggest first.
 * Every value and share is printed beside its bar — no hover needed.
 */
export function CategoryBars({
  rows,
  total,
  t,
  locale,
}: {
  rows: { label: string; amount: number }[];
  total: number;
  t: Dictionary;
  locale: Locale;
}) {
  const max = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <ChartCard title={t.charts.spendTitle} subtitle={t.charts.spendSub}>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">{t.charts.spendEmpty}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{r.label}</span>
                <span className="shrink-0">
                  <span className="tabular font-semibold">{formatMoney(r.amount, locale)}</span>
                  <span className="tabular ml-2 inline-block w-10 text-right text-xs text-muted">
                    {(r.amount / total) * 100 < 1 ? "<1%" : `${Math.round((r.amount / total) * 100)}%`}
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-r-[4px] bg-series-1"
                  style={{ width: `${Math.max((r.amount / max) * 100, 1.5)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
