"use client";

import clsx from "clsx";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/dictionaries";

const OPTIONS: { value: Locale; label: string; full: string }[] = [
  { value: "en", label: "EN", full: "English" },
  { value: "ms", label: "BM", full: "Bahasa Melayu" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={clsx(
        "inline-flex rounded-full border border-border bg-surface p-0.5 text-xs font-semibold",
        pending && "opacity-60",
        className,
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.full}
          aria-pressed={locale === opt.value}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setLocale(opt.value);
              router.refresh();
            })
          }
          className={clsx(
            "min-h-8 min-w-10 rounded-full px-2.5 transition-colors",
            locale === opt.value ? "bg-brand text-on-brand" : "text-muted hover:text-text",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
