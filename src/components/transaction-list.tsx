import clsx from "clsx";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, RefreshCw } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { categoryLabel } from "@/lib/labels";
import { formatDate, todayISO, yesterdayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { AccountWithBalance, Category, Transaction, TransactionKind } from "@/lib/types";

const KIND_ICON: Record<TransactionKind, typeof ArrowDownLeft> = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: ArrowLeftRight,
  adjustment: RefreshCw,
};

/**
 * Signed effect of a transaction. With `accountId`, transfers are shown from
 * that account's point of view (out = negative, in = positive).
 */
function signedAmount(tx: Transaction, accountId?: string) {
  switch (tx.kind) {
    case "income":
      return tx.amount;
    case "expense":
      return -tx.amount;
    case "adjustment":
      return tx.amount;
    case "transfer":
      if (!accountId) return null;
      return tx.to_account_id === accountId ? tx.amount : -tx.amount;
  }
}

export function TransactionList({
  transactions,
  accounts,
  categories,
  t,
  locale,
  accountId,
  emptyText,
  from,
}: {
  /** Page to return to after editing a transaction */
  from?: string;
  transactions: Transaction[];
  accounts: AccountWithBalance[];
  categories: Category[];
  t: Dictionary;
  locale: Locale;
  accountId?: string;
  emptyText?: string;
}) {
  if (transactions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
        {emptyText ?? t.transactions.empty}
      </p>
    );
  }

  const accountName = new Map(accounts.map((a) => [a.id, a.name]));
  const today = todayISO();
  const yesterday = yesterdayISO();
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const groups: { date: string; items: Transaction[] }[] = [];
  for (const tx of transactions) {
    const last = groups.at(-1);
    if (last?.date === tx.occurred_on) last.items.push(tx);
    else groups.push({ date: tx.occurred_on, items: [tx] });
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.date}>
          <h3 className="mb-1.5 px-1 text-xs font-semibold tracking-wide text-muted uppercase">
            {group.date === today
              ? `${t.transactions.today} · ${formatDate(group.date, locale)}`
              : group.date === yesterday
                ? `${t.transactions.yesterday} · ${formatDate(group.date, locale)}`
                : formatDate(group.date, locale)}
          </h3>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {group.items.map((tx) => {
              const Icon = KIND_ICON[tx.kind];
              const category = tx.category_id ? categoryById.get(tx.category_id) : undefined;
              const title = tx.note || categoryLabel(category, t) || t.kinds[tx.kind];
              const from = accountName.get(tx.account_id) ?? "—";
              const where =
                tx.kind === "transfer"
                  ? `${from} → ${accountName.get(tx.to_account_id ?? "") ?? "—"}`
                  : from;
              // Second line: category or type (unless already the title), then account(s).
              const label = tx.note && category ? categoryLabel(category, t) : t.kinds[tx.kind];
              const meta = [label !== title ? label : null, where].filter(Boolean).join(" · ");
              const signed = signedAmount(tx, accountId);

              return (
                <li key={tx.id}>
                  <Link
                    href={`/transactions/${tx.id}/edit${from ? `?from=${encodeURIComponent(from)}` : ""}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2"
                  >
                    <span
                      className={clsx(
                        "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                        tx.kind === "income" && "bg-brand-soft text-income",
                        tx.kind === "expense" && "bg-danger-soft text-expense",
                        (tx.kind === "transfer" || tx.kind === "adjustment") && "bg-surface-2 text-muted",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{title}</p>
                      <p className="truncate text-xs text-muted">{meta}</p>
                    </div>
                    <span
                      className={clsx(
                        "tabular text-sm font-semibold whitespace-nowrap",
                        signed !== null && signed > 0 && "text-income",
                        signed !== null && signed < 0 && "text-expense",
                      )}
                    >
                      {signed === null
                        ? formatMoney(tx.amount, locale)
                        : formatMoney(signed, locale, { signed: true })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
