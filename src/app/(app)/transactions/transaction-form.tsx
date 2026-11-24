"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { ButtonLink, Card, Field, FormError, Input, Select, SubmitButton, noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { categoryLabel } from "@/lib/labels";
import { formatMoney, parseAmountToSen, senToInput } from "@/lib/money";
import type { AccountWithBalance, Category, Transaction, TransactionKind } from "@/lib/types";
import type { FormState } from "@/lib/validation";
import { useFormAction } from "@/lib/use-form-action";

const PICKABLE_KINDS: TransactionKind[] = ["expense", "income", "transfer"];
const LAST_KEY = "ft:last-transaction";

type Last = { kind?: TransactionKind; accountId?: string; toAccountId?: string; category?: Record<string, string> };

function readLast(): Last {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) ?? "{}") as Last;
  } catch {
    return {};
  }
}

/** Effect of a transaction on one account (sen). */
function effectOn(accountId: string, kind: TransactionKind, from: string, to: string, amount: number) {
  if (kind === "transfer") return from === accountId ? -amount : to === accountId ? amount : 0;
  if (from !== accountId) return 0;
  return kind === "expense" ? -amount : amount;
}

export function TransactionForm({
  action,
  accounts,
  categories,
  transaction,
  defaults,
  cancelHref,
  next,
  today,
  yesterday,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  accounts: AccountWithBalance[];
  categories: Category[];
  transaction?: Transaction;
  /** explicit = came from the URL (e.g. "Add transaction" on an account page) */
  defaults: { kind: TransactionKind; accountId?: string; date: string; explicit?: boolean };
  cancelHref: string;
  next?: string;
  today: string;
  yesterday: string;
}) {
  const { t, locale } = useI18n();
  const { state, onSubmit, pending } = useFormAction(action);
  const fe = state.fieldErrors ?? {};

  const firstId = transaction?.account_id ?? defaults.accountId ?? accounts[0]?.id ?? "";
  const [kind, setKind] = useState<TransactionKind>(transaction?.kind ?? defaults.kind);
  const [amountText, setAmountText] = useState(transaction ? senToInput(transaction.amount) : "");
  const [accountId, setAccountId] = useState(firstId);
  const [toAccountId, setToAccountId] = useState(
    transaction?.to_account_id ?? accounts.find((a) => a.id !== firstId)?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
  const [date, setDate] = useState(transaction?.occurred_on ?? defaults.date);

  // New transaction: start from what was used last time (same device).
  useEffect(() => {
    if (transaction) return;
    const last = readLast();
    const valid = (id?: string) => id && accounts.some((a) => a.id === id);
    if (!defaults.explicit && last.kind && PICKABLE_KINDS.includes(last.kind)) setKind(last.kind);
    if (!defaults.explicit && valid(last.accountId)) setAccountId(last.accountId!);
    if (valid(last.toAccountId)) setToAccountId(last.toAccountId!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category: keep the user's pick per kind; else last used for that kind.
  useEffect(() => {
    if (transaction?.kind === kind) return;
    const remembered = readLast().category?.[kind];
    setCategoryId(remembered && categories.some((c) => c.id === remembered && c.kind === kind) ? remembered : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  function remember() {
    try {
      const last = readLast();
      localStorage.setItem(
        LAST_KEY,
        JSON.stringify({
          kind,
          accountId,
          toAccountId: kind === "transfer" ? toAccountId : last.toAccountId,
          category: { ...last.category, ...(categoryId ? { [kind]: categoryId } : {}) },
        }),
      );
    } catch {
      // storage unavailable: nothing to remember
    }
  }

  const kindCategories = categories.filter((c) => c.kind === kind);
  const amount = parseAmountToSen(amountText, { allowNegative: kind === "adjustment" });

  // Live "balance after" preview for the affected account(s).
  const preview = useMemo(() => {
    if (amount === null || amount === 0) return [];
    const ids = kind === "transfer" ? [accountId, toAccountId] : [accountId];
    return ids
      .map((id) => accounts.find((a) => a.id === id))
      .filter((a): a is AccountWithBalance => Boolean(a))
      .map((a) => {
        const before = transaction
          ? a.balance -
            effectOn(a.id, transaction.kind, transaction.account_id, transaction.to_account_id ?? "", transaction.amount)
          : a.balance;
        const after = before + effectOn(a.id, kind, accountId, toAccountId, amount);
        return { name: a.name, before, after };
      });
  }, [amount, kind, accountId, toAccountId, accounts, transaction]);

  const accountOption = (a: AccountWithBalance) => `${a.name} · ${formatMoney(a.balance, locale)}`;

  return (
    <Card>
      <form
        onSubmit={(e) => {
          remember();
          onSubmit(e);
        }}
        className="space-y-5"
        autoComplete="off"
      >
        <FormError message={state.error} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="category_id" value={kind === "income" || kind === "expense" ? categoryId : ""} />
        {next && <input type="hidden" name="next" value={next} />}

        {kind !== "adjustment" ? (
          <div role="radiogroup" aria-label={t.transactions.title} className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
            {PICKABLE_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={clsx(
                  "min-h-11 rounded-lg text-sm font-semibold transition-colors",
                  kind === k
                    ? clsx("bg-surface shadow-sm", k === "income" && "text-income", k === "expense" && "text-expense")
                    : "text-muted hover:text-text",
                )}
              >
                {t.kinds[k]}
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm">
            <strong>{t.kinds.adjustment}</strong> — {t.accounts.updateValueHint}
          </p>
        )}

        <Field label={t.transactions.amount} htmlFor="amount" error={fe.amount}>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            required
            autoFocus={!transaction}
            placeholder="0.00"
            className="tabular min-h-14 text-2xl font-bold"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            {...noAutofill}
          />
        </Field>

        <Field
          label={kind === "transfer" ? t.transactions.fromAccount : t.transactions.account}
          htmlFor="account_id"
          error={fe.account_id}
        >
          <Select id="account_id" name="account_id" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountOption(a)}
              </option>
            ))}
          </Select>
        </Field>

        {kind === "transfer" && (
          <Field label={t.transactions.toAccount} htmlFor="to_account_id" error={fe.to_account_id}>
            <Select
              id="to_account_id"
              name="to_account_id"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountOption(a)}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {preview.length > 0 && (
          <div className="space-y-1 rounded-xl bg-surface-2 px-3 py-2.5 text-sm" aria-live="polite">
            <p className="text-xs font-medium text-muted">{t.transactions.balanceAfter}</p>
            {preview.map((p) => (
              <p key={p.name} className="flex flex-wrap items-center gap-x-2">
                <span className="truncate">{p.name}</span>
                <span className="tabular ml-auto text-muted">{formatMoney(p.before, locale)}</span>
                <ArrowRight className="size-3.5 text-muted" aria-hidden />
                <span className={clsx("tabular font-semibold", p.after < 0 && "text-danger")}>
                  {formatMoney(p.after, locale)}
                </span>
              </p>
            ))}
            {preview.some((p) => p.after < 0 && p.before >= 0) && (
              <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-danger">
                <TriangleAlert className="size-3.5" /> {t.transactions.negativeWarning}
              </p>
            )}
          </div>
        )}

        {(kind === "income" || kind === "expense") && (
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium">
              {t.transactions.category} <span className="font-normal text-muted">({t.common.optional})</span>
            </legend>
            <div role="radiogroup" aria-label={t.transactions.category} className="flex flex-wrap gap-2">
              {kindCategories.map((c) => {
                const active = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCategoryId(active ? "" : c.id)}
                    className={clsx(
                      "min-h-9 rounded-full border px-3 text-sm transition-colors",
                      active
                        ? "border-brand bg-brand-soft font-semibold text-brand-strong"
                        : "border-border text-text hover:bg-surface-2",
                    )}
                  >
                    {categoryLabel(c, t)}
                  </button>
                );
              })}
            </div>
            {fe.category_id && <p className="mt-1 text-xs font-medium text-danger">{fe.category_id}</p>}
          </fieldset>
        )}

        <Field label={t.transactions.date} htmlFor="occurred_on" error={fe.occurred_on}>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: today, label: t.transactions.today },
              { value: yesterday, label: t.transactions.yesterday },
            ].map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDate(d.value)}
                aria-pressed={date === d.value}
                className={clsx(
                  "min-h-11 rounded-xl border px-3 text-sm font-medium transition-colors",
                  date === d.value ? "border-brand bg-brand-soft text-brand-strong" : "border-border hover:bg-surface-2",
                )}
              >
                {d.label}
              </button>
            ))}
            <Input
              id="occurred_on"
              name="occurred_on"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto flex-1"
            />
          </div>
        </Field>

        <Field label={t.transactions.note} htmlFor="note" optional>
          <Input
            id="note"
            name="note"
            maxLength={200}
            placeholder={t.transactions.notePlaceholder}
            {...noAutofill}
            defaultValue={transaction?.note ?? ""}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <ButtonLink href={cancelHref} variant="secondary" className="flex-1">
            {t.common.cancel}
          </ButtonLink>
          <SubmitButton className="flex-1" pending={pending}>
            {t.common.save}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}
