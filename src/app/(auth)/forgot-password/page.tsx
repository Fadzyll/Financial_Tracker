import { ForgotPasswordForm } from "../password-forms";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  return <ForgotPasswordForm expired={notice === "expired"} />;
}
