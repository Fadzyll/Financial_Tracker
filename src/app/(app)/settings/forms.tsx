"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { Field, FormError, Input, Select, SubmitButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import type { FormState } from "@/lib/validation";
import { addCategory, updateProfile } from "./actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const { t } = useI18n();
  const [state, action] = useActionState<FormState & { ok?: boolean }, FormData>(updateProfile, {});
  return (
    <form action={action} className="flex items-end gap-2">
      <div className="flex-1">
        <Field label={t.auth.displayName} htmlFor="display_name" error={state.error}>
          <Input id="display_name" name="display_name" maxLength={60} defaultValue={displayName} />
        </Field>
      </div>
      <SubmitButton variant="secondary">
        {state.ok ? <Check className="size-4" /> : null}
        {t.common.save}
      </SubmitButton>
    </form>
  );
}

export function AddCategoryForm() {
  const { t } = useI18n();
  const [state, action] = useActionState<FormState, FormData>(addCategory, {});
  const formRef = useRef<HTMLFormElement>(null);
  const prev = useRef(state);
  useEffect(() => {
    if (state !== prev.current && !state.error && !state.fieldErrors) formRef.current?.reset();
    prev.current = state;
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <FormError message={state.error} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="name"
          aria-label={t.settings.categoryName}
          placeholder={t.settings.categoryName}
          maxLength={40}
          required
          className="sm:flex-1"
        />
        <Select name="kind" aria-label={t.settings.categories} className="sm:w-40" defaultValue="expense">
          <option value="expense">{t.settings.expense}</option>
          <option value="income">{t.settings.income}</option>
        </Select>
        <SubmitButton variant="secondary">{t.settings.addCategory}</SubmitButton>
      </div>
      {state.fieldErrors?.name && <p className="text-xs font-medium text-danger">{state.fieldErrors.name}</p>}
    </form>
  );
}
