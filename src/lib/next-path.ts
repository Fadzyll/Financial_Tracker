import { isUuid } from "@/lib/validation";

/** Only allow returning to our own pages (never an arbitrary URL). */
export function safeNextPath(value: unknown, fallback = "/transactions") {
  if (typeof value !== "string") return fallback;
  if (["/dashboard", "/transactions", "/accounts", "/goals"].includes(value)) return value;
  if (value.startsWith("/accounts/") && isUuid(value.slice("/accounts/".length))) return value;
  return fallback;
}
