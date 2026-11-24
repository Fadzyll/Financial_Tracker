"use client";

import { useActionState } from "react";
import { Field, FormError, Input, SubmitButton, noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { senToInput } from "@/lib/money";
import type { FormState } from "@/lib/validation";

export function UpdateValueForm({
  action,
  currentBalance,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  currentBalance: number;
}) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-3 pt-3" autoComplete="off">
      <p className="text-xs text-muted">{t.accounts.updateValueHint}</p>
      <FormError message={state.error} />
      <Field label={t.accounts.newValue} htmlFor="new_value" error={state.fieldErrors?.new_value}>
        <Input
          id="new_value"
          name="new_value"
          inputMode="decimal"
          required
          className="tabular"
          defaultValue={senToInput(currentBalance)}
          {...noAutofill}
        />
      </Field>
      <Field label={t.transactions.note} htmlFor="value_note" optional>
        <Input id="value_note" name="note" maxLength={200} {...noAutofill} />
      </Field>
      <SubmitButton className="w-full">{t.accounts.updateValue}</SubmitButton>
    </form>
  );
}
