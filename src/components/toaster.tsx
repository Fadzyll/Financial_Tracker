"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

type Toast = { key: string; href?: string; id: number };

function readFlash(): Toast | null {
  const raw = document.cookie.split("; ").find((c) => c.startsWith("flash="));
  if (!raw) return null;
  document.cookie = "flash=; path=/; max-age=0; samesite=lax";
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.slice(6)));
    return typeof parsed?.key === "string" ? parsed : null;
  } catch {
    return null;
  }
}

/** Shows success messages queued by server actions (see lib/flash.ts). */
export function Toaster() {
  const { t } = useI18n();
  const [toast, setToast] = useState<Toast | null>(null);

  // Cheap cookie check: catches messages after redirects and in-place refreshes.
  useEffect(() => {
    const check = () => {
      const next = readFlash();
      if (next) setToast(next);
    };
    check();
    const timer = setInterval(check, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const message = toast ? (t.toast as Record<string, string>)[toast.key] : null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-6 md:justify-end md:px-6"
    >
      {toast && message && (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm shadow-xl"
        >
          <CheckCircle2 className="size-5 shrink-0 text-brand" />
          <span className="flex-1 font-medium">{message}</span>
          {toast.href && (
            <Link
              href={toast.href}
              onClick={() => setToast(null)}
              className="shrink-0 rounded-lg px-2 py-1 font-semibold text-brand hover:bg-brand-soft"
            >
              {t.toast.addAnother}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label={t.common.cancel}
            className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
