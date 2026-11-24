import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "../password-forms";

/** Reached from the reset email (the link signs the user in first). */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/forgot-password?notice=expired");
  return <ResetPasswordForm />;
}
