import type { Locale } from "@/lib/i18n/dictionaries";

/** Largest amount we accept: RM 1,000,000,000.00 */
const MAX_SEN = 100_000_000_000;

/**
 * Parse user input like "1,234.50" or "RM 20" into sen (integer).
 * Returns null when the input is not a valid amount.
 */
export function parseAmountToSen(input: unknown, { allowNegative = false } = {}): number | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/rm/i, "").replace(/[\s,]/g, "");
  const match = /^(-)?(\d{1,12})(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const [, minus, whole, frac = ""] = match;
  const sen = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (sen > MAX_SEN) return null;
  if (minus && !allowNegative) return null;
  return minus ? -sen : sen;
}

export function formatMoney(sen: number, locale: Locale = "en", opts: { signed?: boolean } = {}) {
  const formatted = new Intl.NumberFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    signDisplay: opts.signed ? "exceptZero" : "auto",
  }).format(sen / 100);
  return formatted;
}

/** Plain number for pre-filling inputs: 123456 -> "1234.56" */
export function senToInput(sen: number) {
  return (sen / 100).toFixed(2);
}
