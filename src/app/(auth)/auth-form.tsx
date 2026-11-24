"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Card, Field, FormError, Input, PasswordInput, SubmitButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { login, signup, type AuthState } from "./actions";

export function AuthForm({ mode, notice }: { mode: "login" | "signup"; notice?: string }) {
  const { t } = useI18n();
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, {});

  if (state.message) {
    return (
      <Card className="text-center">
        <p className="text-sm">{state.message}</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-brand">
          {t.auth.login}
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <form action={action} className="space-y-4">
        <FormError message={state.error ?? notice} />
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
