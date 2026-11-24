"use client";

import clsx from "clsx";
import { ExternalLink, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { SUPPORT_URL } from "@/lib/support";

const external = { href: SUPPORT_URL, target: "_blank", rel: "noopener noreferrer" } as const;

/** Small card at the bottom of the laptop sidebar. */
export function SupportCard() {
  const { t } = useI18n();
  return (
    <a
      {...external}
      className="group block rounded-2xl border border-border bg-surface-2 p-3 transition-colors hover:border-brand/40"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Heart className="size-4 text-series-5 transition-transform group-hover:scale-110" aria-hidden />
        {t.support.title}
        <ExternalLink className="ml-auto size-3.5 text-muted" aria-hidden />
      </span>
      <span className="mt-1 block text-xs leading-snug text-muted">{t.support.body}</span>
    </a>
  );
}

/** Row in the phone avatar menu (same look as Settings / Log out). */
export function SupportMenuItem({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <a
      {...external}
      role="menuitem"
      className={clsx("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-surface-2", className)}
    >
      <Heart className="size-5 text-series-5" aria-hidden /> {t.support.short}
      <ExternalLink className="ml-auto size-3.5 text-muted" aria-hidden />
    </a>
  );
}

/** Button used in the Settings section. */
export function SupportButton() {
  const { t } = useI18n();
  return (
    <a
      {...external}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-2"
    >
      <Heart className="size-4 text-series-5" aria-hidden /> {t.support.cta}
      <ExternalLink className="size-3.5 text-muted" aria-hidden />
    </a>
  );
}
