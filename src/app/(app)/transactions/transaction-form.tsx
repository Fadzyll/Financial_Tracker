"use client";

import clsx from "clsx";
import { useActionState, useState } from "react";
import { ButtonLink, Card, Field, FormError, Input, Select, SubmitButton, noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { categoryLabel } from "@/lib/labels";
import { senToInput } from "@/lib/money";
import type { AccountWithBalance, Category, Transaction, TransactionKind } from "@/lib/types";
import type { FormState } from "@/lib/validation";

const PICKABLE_KINDS: TransactionKind[] = ["expense", "income", "transfer"];

export function TransactionForm({
  action,
  accounts,
  categories,
  transaction,
  defaults,
  cancelHref,
  next,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  accounts: AccountWithBalance[];
  categories: Category[];
  transaction?: Transaction;
  defaults: { kind: TransactionKind; accountId?: string; date: string };
  cancelHref: string;
  next?: string;
}) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(action, {});
  const [kind, setKind] = useState<TransactionKind>(transaction?.kind ?? defaults.kind);
  const fe = state.fieldErrors ?? {};

  const kindCategories = categories.filter((c) => c.kind === kind);
  const firstAccount = transaction?.account_id ?? defaults.accountId ?? accounts[0]?.id;
  const secondAccount =
    transaction?.to_account_id ?? accounts.find((a) => a.id !== firstAccount)?.id ?? "";

  return (
    <Card>
      <form action={formAction} className="space-y-4" autoComplete="off">
        <FormError message={state.error} />
        <input type="hidden" name="kind" value={kind} />
        {next && <input type="hidden" name="next" value={next} />}

        {kind !== "adjustment" && (
          <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
            {PICKABLE_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={clsx(
                  "min-h-10 rounded-lg text-sm font-semibold transition-colors",
                  kind === k
                    ? clsx(
                        "bg-surface shadow-sm",
                        k === "income" && "text-income",
                        k === "expense" && "text-expense",
                      )
                    : "text-muted hover:text-text",
                )}
              >
                {t.kinds[k]}
              </button>
            ))}
          </div>
        )}
        {kind === "adjustment" && (
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
            className="tabular text-lg font-semibold"
            {...noAutofill}
            defaultValue={transaction ? senToInput(transaction.amount) : ""}
          />
        </Field>

        <Field
          label={kind === "transfer" ? t.transactions.fromAccount : t.transactions.account}
          htmlFor="account_id"
          error={fe.account_id}
        >
          <Select id="account_id" name="account_id" defaultValue={firstAccount} required>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>

        {kind === "transfer" && (
          <Field label={t.transactions.toAccount} htmlFor="to_account_id" error={fe.to_account_id}>
            <Select id="to_account_id" name="to_account_id" defaultValue={secondAccount} required>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {(kind === "income" || kind === "expense") && (
          <Field label={t.transactions.category} htmlFor="category_id" error={fe.category_id} optional>
            <Select
              key={kind}
              id="category_id"
              name="category_id"
              defaultValue={
                transaction?.kind === kind ? (transaction.category_id ?? "") : (kindCategories[0]?.id ?? "")
              }
            >
              <option value="">{t.common.none}</option>
              {kindCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c, t)}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label={t.transactions.date} htmlFor="occurred_on" error={fe.occurred_on}>
          <Input
            id="occurred_on"
            name="occurred_on"
            type="date"
            required
            defaultValue={transaction?.occurred_on ?? defaults.date}
          />
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
          <SubmitButton className="flex-1">{t.common.save}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
