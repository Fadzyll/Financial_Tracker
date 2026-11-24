"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";

/** Measures an element's width so SVG charts render at real pixel size. */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** Legend key: a rect for bars/areas, a line for lines. Text stays in text ink. */
export function LegendItem({ color, label, shape = "rect" }: { color: string; label: string; shape?: "rect" | "line" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      {shape === "rect" ? (
        <span className="size-2.5 rounded-[3px]" style={{ background: color }} />
      ) : (
        <span className="h-0.5 w-3.5 rounded-full" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}

export function ChartCard({
  title,
  subtitle,
  legend,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("rounded-2xl border border-border bg-surface p-4 sm:p-5", className)}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {legend && <div className="flex flex-wrap items-center gap-3">{legend}</div>}
      </div>
      {children}
    </section>
  );
}

/** Collapsible table so every value is readable without hovering. */
export function TableView({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  const { t } = useI18n();
  return (
    <details className="mt-3 text-xs">
      <summary className="cursor-pointer text-muted select-none hover:text-text">{t.charts.showTable}</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} className={clsx("border-b border-border py-1.5 font-medium text-muted", i ? "text-right" : "text-left")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={clsx("border-b border-border/60 py-1.5", j ? "tabular text-right" : "")}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Floating readout. Values lead (strong); series names follow (muted). */
export function Tooltip({
  x,
  width,
  title,
  rows,
}: {
  /** x of the hovered point/column centre (px) */
  x: number;
  width: number;
  title: string;
  rows: { color?: string; label: string; value: string }[];
}) {
  const boxW = 224;
  const gap = 16;
  // Sit beside the hovered point (never on top of it): right if there is room, else left.
  const preferred = x + gap + boxW <= width ? x + gap : x - gap - boxW;
  const left = Math.min(Math.max(preferred, 0), Math.max(width - boxW, 0));
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-0 z-10 rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-lg"
      style={{ left, width: boxW }}
    >
      <p className="mb-1 font-medium text-muted">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2">
          {r.color ? <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: r.color }} /> : <span className="w-3" />}
          <span className="tabular font-semibold text-text">{r.value}</span>
          <span className="ml-auto whitespace-nowrap text-muted">{r.label}</span>
        </p>
      ))}
    </div>
  );
}

/** Bar path with 4px rounded data-end (top) and a square baseline. */
export function barPath(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}
