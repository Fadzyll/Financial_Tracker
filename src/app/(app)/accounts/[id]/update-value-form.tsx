"use client";

import { Field, FormError, Input, SubmitButton, noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { senToInput } from "@/lib/money";
import type { FormState } from "@/lib/validation";
import { useFormAction } from "@/lib/use-form-action";

export function UpdateValueForm({
  action,
  currentBalance,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  currentBalance: number;
}) {
  const { t } = useI18n();
  const { state, onSubmit, pending } = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="space-y-3 pt-3" autoComplete="off">
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
      <SubmitButton className="w-full" pending={pending}>{t.accounts.updateValue}</SubmitButton>
    </form>
  );
}
