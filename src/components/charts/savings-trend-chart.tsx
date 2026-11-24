"use client";

import { useState } from "react";
import { ChartCard, TableView, Tooltip, useWidth } from "./chart-kit";
import { useI18n } from "@/lib/i18n/client";
import { formatMonth, formatMonthShort } from "@/lib/dates";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { niceScale, type SavingsPoint } from "@/lib/charts";

const H = 220;
const M = { top: 10, right: 12, bottom: 26, left: 56 };

/** Area + 2px line of month-end total savings, with a snapping crosshair. */
export function SavingsTrendChart({ points }: { points: SavingsPoint[] }) {
  const { t, locale } = useI18n();
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <ChartCard title={t.charts.trendTitle} subtitle={t.charts.trendSub}>
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">{t.charts.trendEmpty}</p>
      </ChartCard>
    );
  }

  const values = points.map((p) => p.total);
  const { lo, hi, ticks } = niceScale(Math.min(...values), Math.max(...values));
  const plotW = Math.max(width - M.left - M.right, 0);
  const plotH = H - M.top - M.bottom;
  const x = (i: number) => M.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => M.top + plotH - ((v - lo) / (hi - lo || 1)) * plotH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.total)}`).join("");
  const area = `${line}L${x(points.length - 1)},${y(Math.max(lo, 0))}L${x(0)},${y(Math.max(lo, 0))}Z`;
  const labelEvery = plotW / points.length < 42 ? 2 : 1;

  function nearest(clientX: number, el: Element) {
    const px = clientX - el.getBoundingClientRect().left;
    const i = Math.round(((px - M.left) / (plotW || 1)) * (points.length - 1));
    return Math.min(points.length - 1, Math.max(0, i));
  }

  const ap = active !== null ? points[active] : null;

  return (
    <ChartCard title={t.charts.trendTitle} subtitle={t.charts.trendSub}>
      <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
        {width > 0 && (
          <svg
            width={width}
            height={H}
            role="img"
            aria-label={`${t.charts.trendTitle}: ${formatMoney(values.at(-1)!, locale)}`}
            tabIndex={0}
            className="outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-brand/40"
            onPointerMove={(e) => setActive(nearest(e.clientX, e.currentTarget))}
            onFocus={() => setActive(points.length - 1)}
            onBlur={() => setActive(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? points.length) - 1));
              if (e.key === "ArrowRight") setActive((a) => Math.min(points.length - 1, (a ?? -1) + 1));
            }}
          >
            {ticks.map((v) => (
              <g key={v}>
                <line x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} stroke={v === 0 ? "var(--axis)" : "var(--grid)"} />
                <text x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px]">
                  {formatMoneyCompact(v, locale)}
                </text>
              </g>
            ))}
            <path d={area} fill="var(--series-1)" opacity={0.12} />
            <path d={line} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) =>
              i % labelEvery === (points.length - 1) % labelEvery ? (
                <text key={p.month} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted text-[11px]">
                  {formatMonthShort(p.month, locale, i === 0 || p.month.endsWith("-01"))}
                </text>
              ) : null,
            )}
            {active === null && (
              <circle cx={x(points.length - 1)} cy={y(values.at(-1)!)} r={4.5} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />
            )}
            {active !== null && (
              <g>
                <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + plotH} stroke="var(--axis)" />
                <circle cx={x(active)} cy={y(points[active].total)} r={5} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />
              </g>
            )}
          </svg>
        )}
        {ap && active !== null && (
          <Tooltip
            x={x(active)}
            width={width}
            title={formatMonth(ap.month, locale)}
            rows={[{ color: "var(--series-1)", label: t.charts.total, value: formatMoney(ap.total, locale) }]}
          />
        )}
        {width === 0 && <div style={{ height: H }} />}
      </div>
      <TableView
        head={[t.charts.month, t.charts.total]}
        rows={points.map((p) => [formatMonth(p.month, locale), formatMoney(p.total, locale)])}
      />
    </ChartCard>
  );
}
