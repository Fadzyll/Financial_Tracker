import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the link in the sign-up confirmation email.
//
// - token_hash links (custom email template): verified here, works on any device.
// - ?code= links (Supabase default): Supabase has ALREADY confirmed the email
//   before redirecting here. Logging in automatically only works in the same
//   browser that signed up; in any other browser (e.g. the link opened from the
//   Gmail app) we tell the user their email is confirmed and to log in.
// - ?error_code=otp_expired etc.: the link itself is expired or already used.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const go = (path: string) => NextResponse.redirect(new URL(path, origin));

  const errorCode = searchParams.get("error_code") ?? searchParams.get("error");
  if (errorCode) return go(errorCode === "otp_expired" ? "/login?notice=expired" : "/login?error=confirm");

  const supabase = await createClient();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    return go(error ? "/login?notice=expired" : "/dashboard");
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return go(error ? "/login?notice=confirmed" : "/dashboard");
  }

  return go("/login?error=confirm");
}
