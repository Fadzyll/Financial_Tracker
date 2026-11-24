"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { ProgressBar } from "@/components/ui";
import { fmt } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/client";

const HIDE_KEY = "ft:hide-getting-started";

/** First-run checklist. Disappears when all steps are done (or when hidden). */
export function GettingStarted({ done }: { done: [boolean, boolean, boolean] }) {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDE_KEY) === "1");
    } catch {}
  }, []);

  const count = done.filter(Boolean).length;
  // Can't hide it before there is at least one account — the app is empty then.
  if (count === 3 || (hidden && done[0])) return null;

  const steps = [
    { href: "/accounts/new", title: t.onboarding.step1, hint: t.onboarding.step1Hint },
    { href: "/transactions/new?from=%2Fdashboard", title: t.onboarding.step2, hint: t.onboarding.step2Hint },
    { href: "/goals/new", title: t.onboarding.step3, hint: t.onboarding.step3Hint },
  ];
  const nextIndex = done.findIndex((d) => !d);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t.onboarding.title}</h2>
          <p className="text-sm text-muted">{t.onboarding.subtitle}</p>
        </div>
        {done[0] && (
          <button
            type="button"
            onClick={() => {
              setHidden(true);
              try {
                localStorage.setItem(HIDE_KEY, "1");
              } catch {}
            }}
            className="rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text"
          >
            {t.onboarding.hide}
          </button>
        )}
      </div>
      <div className="mb-3 flex items-center gap-3">
        <ProgressBar value={(count / 3) * 100} />
        <span className="shrink-0 text-xs text-muted">{fmt(t.onboarding.progress, { done: count })}</span>
      </div>
      <ol className="space-y-2">
        {steps.map((step, i) => {
          const isDone = done[i];
          const isNext = i === nextIndex;
          const body = (
            <>
              <span
                className={clsx(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  isDone ? "bg-brand text-on-brand" : isNext ? "bg-brand-soft text-brand-strong" : "bg-surface-2 text-muted",
                )}
              >
                {isDone ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={clsx("block text-sm font-medium", isDone && "text-muted line-through")}>{step.title}</span>
                {!isDone && <span className="block text-xs text-muted">{step.hint}</span>}
              </span>
              {!isDone && <ChevronRight className="size-5 shrink-0 text-muted" />}
            </>
          );
          return (
            <li key={step.href}>
              {isDone ? (
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">{body}</div>
              ) : (
                <Link
                  href={step.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2",
                    isNext && "bg-brand-soft/40 ring-1 ring-brand/30",
                  )}
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
