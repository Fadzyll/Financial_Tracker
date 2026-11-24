"use client";

import { useState } from "react";
import { ChartCard, LegendItem, TableView, Tooltip, barPath, useWidth } from "./chart-kit";
import { useI18n } from "@/lib/i18n/client";
import { formatMonth, formatMonthShort } from "@/lib/dates";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { niceTicks, type MonthFlow } from "@/lib/charts";

const H = 220;
const M = { top: 8, right: 4, bottom: 26, left: 56 };

/** Grouped bars: money in vs money out per month. */
export function MonthlyFlowChart({ data }: { data: MonthFlow[] }) {
  const { t, locale } = useI18n();
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const series = [
    { key: "income" as const, label: t.dashboard.moneyIn, color: "var(--series-1)" },
    { key: "expense" as const, label: t.dashboard.moneyOut, color: "var(--series-2)" },
  ];
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 0);
  const ticks = niceTicks(max || 100_00);
  const top = ticks.at(-1)!;
  const plotW = Math.max(width - M.left - M.right, 0);
  const plotH = H - M.top - M.bottom;
  const groupW = plotW / data.length;
  const barW = Math.max(4, Math.min(18, (groupW * 0.62 - 2) / 2));
  const y = (v: number) => M.top + plotH - (v / top) * plotH;

  const activeRow = active !== null ? data[active] : null;

  return (
    <ChartCard
      title={t.charts.flowTitle}
      subtitle={t.charts.flowSub}
      legend={series.map((s) => <LegendItem key={s.key} color={s.color} label={s.label} />)}
    >
      <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
        {width > 0 && (
          <svg width={width} height={H} role="img" aria-label={`${t.charts.flowTitle}, ${t.charts.flowSub}`}>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} stroke={v === 0 ? "var(--axis)" : "var(--grid)"} />
                <text x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px]">
                  {formatMoneyCompact(v, locale)}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const cx = M.left + groupW * i + groupW / 2;
              const dim = active !== null && active !== i;
              return (
                <g key={d.month}>
                  {active === i && (
                    <rect x={cx - groupW / 2 + 2} y={M.top} width={groupW - 4} height={plotH} rx={6} fill="var(--surface-2)" />
                  )}
                  {series.map((s, si) => {
                    const v = d[s.key];
                    const x = si === 0 ? cx - 1 - barW : cx + 1; // 2px gap between the pair
                    return (
                      <path
                        key={s.key}
                        d={barPath(x, y(v), barW, y(0) - y(v))}
                        fill={s.color}
                        opacity={dim ? 0.45 : 1}
                      />
                    );
                  })}
                  <text x={cx} y={H - 8} textAnchor="middle" className="fill-muted text-[11px]">
                    {formatMonthShort(d.month, locale)}
                  </text>
                  {/* Hit target: the whole month column, bigger than the bars */}
                  <rect
                    x={cx - groupW / 2}
                    y={M.top}
                    width={groupW}
                    height={plotH + M.bottom}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${formatMonth(d.month, locale)}: ${t.dashboard.moneyIn} ${formatMoney(d.income, locale)}, ${t.dashboard.moneyOut} ${formatMoney(d.expense, locale)}`}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="outline-none"
                  />
                </g>
              );
            })}
          </svg>
        )}
        {activeRow && active !== null && (
          <Tooltip
            x={M.left + groupW * active + groupW / 2 + (barW + 1) * (M.left + groupW * active + groupW / 2 + 240 <= width ? 1 : -1)}
            width={width}
            title={formatMonth(activeRow.month, locale)}
            rows={[
              ...series.map((s) => ({ color: s.color, label: s.label, value: formatMoney(activeRow[s.key], locale) })),
              { label: t.charts.net, value: formatMoney(activeRow.income - activeRow.expense, locale, { signed: true }) },
            ]}
          />
        )}
        {width === 0 && <div style={{ height: H }} />}
      </div>
      <TableView
        head={[t.charts.month, t.dashboard.moneyIn, t.dashboard.moneyOut, t.charts.net]}
        rows={data.map((d) => [
          formatMonth(d.month, locale),
          formatMoney(d.income, locale),
          formatMoney(d.expense, locale),
          formatMoney(d.income - d.expense, locale, { signed: true }),
        ])}
      />
    </ChartCard>
  );
}
