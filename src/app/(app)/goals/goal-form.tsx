"use client";

import clsx from "clsx";
import { useActionState, useState } from "react";
import { ButtonLink, Card, Field, FormError, Input, SubmitButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { formatMoney, senToInput } from "@/lib/money";
import type { AccountWithBalance, Goal } from "@/lib/types";
import type { FormState } from "@/lib/validation";

export function GoalForm({
  action,
  accounts,
  goal,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  accounts: AccountWithBalance[];
  goal?: Goal;
}) {
  const { t, locale } = useI18n();
  const [state, formAction] = useActionState(action, {});
  const [scope, setScope] = useState<"all" | "accounts">(goal?.scope ?? "accounts");
  const linked = new Set(goal?.goal_accounts.map((g) => g.account_id));
  const fe = state.fieldErrors ?? {};

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <FormError message={state.error} />
        <Field label={t.goals.name} htmlFor="name" error={fe.name}>
          <Input
            id="name"
            name="name"
            required
            maxLength={60}
            placeholder={t.goals.namePlaceholder}
            defaultValue={goal?.name}
          />
        </Field>
        <Field label={t.goals.target} htmlFor="target_amount" error={fe.target_amount}>
          <Input
            id="target_amount"
            name="target_amount"
            inputMode="decimal"
            required
            placeholder="10,000"
            className="tabular"
            defaultValue={goal ? senToInput(goal.target_amount) : ""}
          />
        </Field>
        <Field label={t.goals.targetDate} htmlFor="target_date" error={fe.target_date} optional>
          <Input id="target_date" name="target_date" type="date" defaultValue={goal?.target_date ?? ""} />
        </Field>

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium">{t.goals.scope}</legend>
          {(["accounts", "all"] as const).map((value) => (
            <label
              key={value}
              className={clsx(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm",
                scope === value ? "border-brand bg-brand-soft/50" : "border-border",
              )}
            >
              <input
                type="radio"
                name="scope"
                value={value}
                checked={scope === value}
                onChange={() => setScope(value)}
                className="size-4 accent-brand"
              />
              {value === "all" ? t.goals.scopeAll : t.goals.scopeAccounts}
            </label>
          ))}
        </fieldset>

        {scope === "accounts" && (
          <fieldset className="space-y-2">
            {accounts.map((a) => (
              <label
                key={a.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="account_ids"
                  value={a.id}
                  defaultChecked={linked.has(a.id)}
                  className="size-4 accent-brand"
                />
                <span className="flex-1 truncate">{a.name}</span>
                <span className="tabular text-muted">{formatMoney(a.balance, locale)}</span>
              </label>
            ))}
            {fe.account_ids && <p className="text-xs font-medium text-danger">{fe.account_ids}</p>}
          </fieldset>
        )}
        {scope === "all" && <p className="text-xs text-muted">{t.goals.sharedNote}</p>}

        <div className="flex gap-3 pt-2">
          <ButtonLink href="/goals" variant="secondary" className="flex-1">
            {t.common.cancel}
          </ButtonLink>
          <SubmitButton className="flex-1">{t.common.save}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
