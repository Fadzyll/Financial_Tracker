import "server-only";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type DbError = { message: string; code?: string; details?: string | null; hint?: string | null };

/** Codes meaning the database is missing a table/column/permission the app expects. */
const SETUP_CODES = new Set(["PGRST204", "PGRST205", "42703", "42P01", "42501"]);

/**
 * Log a Supabase error (visible in Vercel → Logs) and turn it into a message
 * for the user. Setup problems get a specific hint instead of "try again".
 */
export function dbErrorMessage(error: DbError, t: Dictionary, where: string) {
  console.error(`[${where}] ${error.code ?? ""} ${error.message}`, error.details ?? "", error.hint ?? "");
  return error.code && SETUP_CODES.has(error.code) ? t.common.dbOutdated : t.common.genericError;
}
