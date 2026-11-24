import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles links in emails from Supabase: sign-up confirmation and password reset.
//
// - token_hash links (our custom email templates): verified here, work on any device.
// - ?code= links (Supabase default templates): only finish in the browser that
//   asked for them. For sign-up, Supabase has ALREADY confirmed the email, so we
//   just ask the user to log in. For password reset we ask for a fresh link.
// - ?error_code=otp_expired etc.: the link itself is expired or already used.
const ALLOWED_NEXT = new Set(["/dashboard", "/reset-password"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // Redirect to the same host the browser used (keeps the session cookie with it).
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const go = (path: string) => NextResponse.redirect(new URL(path, `${proto}://${host}`));

  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "";
  const isRecovery = type === "recovery" || nextParam === "/reset-password";
  const next = ALLOWED_NEXT.has(nextParam) ? nextParam : isRecovery ? "/reset-password" : "/dashboard";
  const failed = isRecovery ? "/forgot-password?notice=expired" : "/login?notice=expired";

  const errorCode = searchParams.get("error_code") ?? searchParams.get("error");
  if (errorCode) return go(errorCode === "otp_expired" || isRecovery ? failed : "/login?error=confirm");

  const supabase = await createClient();
  const tokenHash = searchParams.get("token_hash");
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    return go(error ? failed : next);
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return go(next);
    return go(isRecovery ? failed : "/login?notice=confirmed");
  }

  return go(isRecovery ? failed : "/login?error=confirm");
}
