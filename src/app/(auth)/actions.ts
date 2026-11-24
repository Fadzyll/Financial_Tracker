"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/dictionaries";

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
