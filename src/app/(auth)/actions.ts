"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/dictionaries";
import { flash } from "@/lib/flash";

export type AuthState = { error?: string; message?: string; email?: string; canResend?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email)) return { error: t.auth.invalidEmail, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") return { error: t.auth.emailNotConfirmed, email, canResend: true };
  if (error) return { error: t.auth.invalidCredentials, email };
  redirect("/dashboard");
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 60);
  if (!EMAIL_RE.test(email)) return { error: t.auth.invalidEmail, email };
  if (password.length < 8) return { error: t.auth.passwordTooShort, email };

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || null },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) return { error: t.auth.signupFailed, email };

  // Email confirmation disabled in Supabase → already logged in.
  if (data.session) redirect("/dashboard");
  return { message: t.auth.checkEmail, email };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Send a fresh sign-up confirmation email. */
export async function resendConfirmation(email: string): Promise<{ ok: boolean; message: string }> {
  const { t } = await getI18n();
  if (!EMAIL_RE.test(email)) return { ok: false, message: t.auth.invalidEmail };
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return { ok: false, message: t.auth.resendFailed };
  return { ok: true, message: fmt(t.auth.resent, { email }) };
}

export type PasswordState = { error?: string; message?: string; email?: string };

/** Email a password-reset link. Same answer whether or not the account exists. */
export async function requestPasswordReset(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { error: t.auth.invalidEmail, email };
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  if (error?.status === 429) return { error: t.auth.resendFailed, email };
  return { message: fmt(t.auth.resetSent, { email }) };
}

/** Set a new password for the user signed in through the reset link. */
export async function setNewPassword(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const { t } = await getI18n();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: t.auth.passwordTooShort };
  if (password !== confirm) return { error: t.auth.passwordsDontMatch };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/forgot-password?notice=expired");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.code === "same_password" ? t.auth.samePassword : t.common.genericError };
  await flash("passwordChanged");
  redirect("/dashboard");
}
