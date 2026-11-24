import type { Locale } from "@/lib/i18n/dictionaries";

/** Today's date as YYYY-MM-DD in Malaysia time. */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}

/** "2026-11" for the current month in Malaysia time. */
export function currentMonth() {
  return todayISO().slice(0, 7);
}

export function isValidISODate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function isValidMonth(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** First day of the month and first day of the next month, for range queries. */
export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return { start, next };
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatMonth(month: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

/** Whole months from today until the target date (minimum 1 if in the future). */
export function monthsUntil(targetISO: string) {
  const today = todayISO();
  if (targetISO <= today) return 0;
  const [ty, tm] = today.split("-").map(Number);
  const [gy, gm] = targetISO.split("-").map(Number);
  return Math.max(1, (gy - ty) * 12 + (gm - tm));
}

/** "Nov" / "Nov 26" style short month label. */
export function formatMonthShort(month: string, locale: Locale, withYear = false) {
  return new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    month: "short",
    ...(withYear ? { year: "2-digit" as const } : {}),
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}
