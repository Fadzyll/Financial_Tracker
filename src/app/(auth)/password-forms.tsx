"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { Card, Field, FormError, Input, PasswordInput, SubmitButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { requestPasswordReset, setNewPassword, type PasswordState } from "./actions";

function Notice({ tone, children }: { tone: "success" | "info"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : Info;
  return (
    <p
      role="status"
      className={
        tone === "success"
          ? "flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2 text-sm font-medium text-brand-strong"
          : "flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden /> <span>{children}</span>
    </p>
  );
}

export function ForgotPasswordForm({ expired }: { expired?: boolean }) {
  const { t } = useI18n();
  const [state, action] = useActionState<PasswordState, FormData>(requestPasswordReset, {});
  return (
    <Card>
      <h2 className="font-semibold">{t.auth.forgotTitle}</h2>
      <p className="mt-1 mb-4 text-sm text-muted">{t.auth.forgotHint}</p>
      {state.message ? (
        <Notice tone="success">{state.message}</Notice>
      ) : (
        <form action={action} className="space-y-4">
          <FormError message={state.error} />
          {expired && !state.error && <Notice tone="info">{t.auth.resetExpired}</Notice>}
          <Field label={t.auth.email} htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
          </Field>
          <SubmitButton className="w-full">{t.auth.sendResetLink}</SubmitButton>
        </form>
      )}
      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="font-semibold text-brand">
          {t.auth.backToLogin}
        </Link>
      </p>
    </Card>
  );
}

export function ResetPasswordForm() {
  const { t } = useI18n();
  const [state, action] = useActionState<PasswordState, FormData>(setNewPassword, {});
  return (
    <Card>
      <h2 className="mb-4 font-semibold">{t.auth.resetTitle}</h2>
      <form action={action} className="space-y-4">
        <FormError message={state.error} />
        <Field label={t.auth.newPassword} htmlFor="password" hint={t.auth.passwordHint}>
          <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label={t.auth.confirmPassword} htmlFor="confirm">
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" minLength={8} required />
        </Field>
        <SubmitButton className="w-full">{t.auth.setNewPassword}</SubmitButton>
      </form>
    </Card>
  );
}
