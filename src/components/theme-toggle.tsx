"use client";

import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Sun/moon button. Switches instantly on the page and remembers the choice in
 * a cookie so the server renders the same theme next time (no flash).
 * Which icon shows is decided by CSS, so it is correct before JS loads.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      aria-label={t.common.toggleTheme}
      title={t.common.toggleTheme}
      onClick={() => {
        const next: Theme = currentTheme() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={clsx(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-text",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
    >
      <Sun className="theme-icon-sun size-[18px]" />
      <Moon className="theme-icon-moon size-[18px]" />
    </button>
  );
}
