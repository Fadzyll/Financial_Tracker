"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { CheckCircle2, Info, MailCheck } from "lucide-react";
import { Card, Field, FormError, Input, PasswordInput, SubmitButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { login, resendConfirmation, signup, type AuthState } from "./actions";

function Banner({ tone, children }: { tone: "success" | "info"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : Info;
  return (
    <p
      role="status"
      className={
        tone === "success"
          ? "flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2 text-sm font-medium text-brand-strong"
          : "flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm text-text"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden /> <span>{children}</span>
    </p>
  );
}

/** "Resend confirmation email" with its own result message. */
function ResendButton({ email }: { email: string }) {
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending || Boolean(result?.ok)}
        onClick={() => start(async () => setResult(await resendConfirmation(email)))}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-2 disabled:opacity-60"
      >
        <MailCheck className="size-4" aria-hidden /> {pending ? t.common.saving : t.auth.resend}
      </button>
      {result && (result.ok ? <Banner tone="success">{result.message}</Banner> : <FormError message={result.message} />)}
    </div>
  );
}

export function AuthForm({
  mode,
  notice,
  success,
  info,
}: {
  mode: "login" | "signup";
  notice?: string;
  success?: string;
  info?: string;
}) {
  const { t } = useI18n();
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, {});

  if (state.message) {
    return (
      <Card className="space-y-4 text-center">
        <MailCheck className="mx-auto size-8 text-brand" aria-hidden />
        <p className="text-sm">{state.message}</p>
        {state.email && <ResendButton email={state.email} />}
        <Link href="/login" className="inline-block text-sm font-semibold text-brand">
          {t.auth.login}
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <form action={action} className="space-y-4">
        <FormError message={state.error ?? notice} />
        {!state.error && success && <Banner tone="success">{success}</Banner>}
        {!state.error && info && <Banner tone="info">{info}</Banner>}
        {state.canResend && state.email && <ResendButton email={state.email} />}
        {mode === "signup" && (
          <Field label={t.auth.displayName} htmlFor="display_name" optional>
            <Input id="display_name" name="display_name" autoComplete="name" maxLength={60} />
          </Field>
        )}
        <Field label={t.auth.email} htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
          />
        </Field>
        <Field
          label={t.auth.password}
          htmlFor="password"
          hint={mode === "signup" ? t.auth.passwordHint : undefined}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
          />
        </Field>
        <SubmitButton className="w-full">{mode === "login" ? t.auth.login : t.auth.signup}</SubmitButton>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-semibold text-brand">
          {mode === "login" ? t.auth.signup : t.auth.login}
        </Link>
      </p>
    </Card>
  );
}
