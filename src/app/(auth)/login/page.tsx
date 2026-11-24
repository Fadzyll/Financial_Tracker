import { AuthForm } from "../auth-form";
import { getI18n } from "@/lib/i18n/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { t } = await getI18n();
  const { error, notice } = await searchParams;
  return (
    <AuthForm
      mode="login"
      notice={error === "confirm" ? t.auth.confirmFailed : undefined}
      success={notice === "confirmed" ? t.auth.confirmedLogin : undefined}
      info={notice === "expired" ? t.auth.linkExpired : undefined}
    />
  );
}
