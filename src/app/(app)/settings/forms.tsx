"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { Field, FormError, Input, PasswordInput, Select, SubmitButton, noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import type { FormState } from "@/lib/validation";
import { addCategory, changePassword, deleteMyAccount, updateProfile } from "./actions";

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
          name="category_name"
          aria-label={t.settings.categoryName}
          {...noAutofill}
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

export function ChangePasswordForm() {
  const { t } = useI18n();
  const [state, action] = useActionState<FormState & { ok?: boolean }, FormData>(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);
  const fe = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={action} className="space-y-3">
      <FormError message={state.error} />
      <Field label={t.auth.currentPassword} htmlFor="current" error={fe.current}>
        <PasswordInput id="current" name="current" autoComplete="current-password" required />
      </Field>
      <Field label={t.auth.newPassword} htmlFor="new_password" error={fe.password}>
        <PasswordInput id="new_password" name="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label={t.auth.confirmPassword} htmlFor="confirm_password" error={fe.confirm}>
        <PasswordInput id="confirm_password" name="confirm" autoComplete="new-password" minLength={8} required />
      </Field>
      <SubmitButton variant="secondary">{t.auth.changePassword}</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const { t } = useI18n();
  const [state, action] = useActionState<FormState, FormData>(deleteMyAccount, {});
  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-sm font-semibold text-danger select-none">
        {t.settings.deleteOpen} <span className="inline-block transition-transform group-open:rotate-90">›</span>
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <FormError message={state.error} />
        <p className="text-xs text-muted">{t.settings.deleteTip}</p>
        <Field label={t.settings.deleteConfirmLabel} htmlFor="confirm_email" error={state.fieldErrors?.confirm_email}>
          <Input id="confirm_email" name="confirm_email" type="email" placeholder={email} required {...noAutofill} />
        </Field>
        <SubmitButton variant="danger" className="w-full" confirmMessage={t.common.confirmDelete}>
          {t.settings.deleteButton}
        </SubmitButton>
      </form>
    </details>
  );
}
