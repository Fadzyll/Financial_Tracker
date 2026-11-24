import { AuthForm } from "../auth-form";
import { getI18n } from "@/lib/i18n/server";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { t } = await getI18n();
  const { error } = await searchParams;
  return <AuthForm mode="login" notice={error === "confirm" ? t.auth.confirmFailed : undefined} />;
}
