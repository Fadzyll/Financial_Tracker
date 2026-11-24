import clsx from "clsx";
import Link from "next/link";

const OPTIONS = ["3m", "6m", "1y"] as const;

/** Segmented period switch. Plain links: works without JS, keeps scroll position. */
export function RangeFilter({ value, labels }: { value: string; labels: Record<string, string> }) {
  return (
    <nav className="inline-flex rounded-full border border-border bg-surface p-0.5 text-xs font-semibold">
      {OPTIONS.map((r) => (
        <Link
          key={r}
          href={`/dashboard?range=${r}`}
          scroll={false}
          replace
          aria-current={value === r ? "true" : undefined}
          className={clsx(
            "inline-flex min-h-8 items-center rounded-full px-3 transition-colors",
            value === r ? "bg-brand text-on-brand" : "text-muted hover:text-text",
          )}
        >
          {labels[r]}
        </Link>
      ))}
    </nav>
  );
}
