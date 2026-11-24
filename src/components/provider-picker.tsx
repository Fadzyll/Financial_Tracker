"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, PencilLine, Search, X } from "lucide-react";
import { ProviderLogo } from "@/components/provider-logo";
import { noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { PROVIDER_GROUPS, getProvider, searchProviders, type Provider, type ProviderGroup } from "@/lib/providers";

export const OTHER = "other";

/**
 * Searchable bank / provider picker with logos.
 * `value` is a provider id, "other" (custom name) or "" (nothing chosen).
 */
export function ProviderPicker({
  value,
  onChange,
  id,
  groups = PROVIDER_GROUPS,
}: {
  value: string;
  onChange: (value: string, provider?: Provider) => void;
  id?: string;
  /** Only show providers from these groups (e.g. banks for a Bank account) */
  groups?: ProviderGroup[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = getProvider(value);
  const results = useMemo(
    () => searchProviders(query).filter((p) => groups.includes(p.group)),
    [query, groups],
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const timer = setTimeout(() => searchRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function pick(next: string, provider?: Provider) {
    onChange(next, provider);
    close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-left hover:bg-surface-2 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
      >
        {selected ? (
          <>
            <ProviderLogo provider={selected} />
            <span className="min-w-0 flex-1 truncate font-medium">{selected.name}</span>
          </>
        ) : value === OTHER ? (
          <>
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
              <PencilLine className="size-5" />
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{t.accounts.providerOther}</span>
          </>
        ) : (
          <span className="flex-1 text-muted">{t.accounts.providerPick}</span>
        )}
        <ChevronDown className="size-5 shrink-0 text-muted" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t.accounts.providerPick}
              className="relative flex max-h-[85dvh] w-full flex-col rounded-t-3xl border border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl sm:max-h-[75dvh] sm:max-w-lg sm:rounded-3xl"
            >
              <div className="flex items-center gap-2 border-b border-border p-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.accounts.providerSearch}
                    aria-label={t.accounts.providerSearch}
                    className="block min-h-11 w-full rounded-xl border border-border bg-surface-2 pr-3 pl-9 text-base text-text placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none"
                    {...noAutofill}
                  />
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t.common.cancel}
                  className="inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-2">
                {groups.map((group) => {
                  const items = results.filter((p) => p.group === group);
                  if (items.length === 0) return null;
                  return (
                    <section key={group} className="mb-2">
                      <h3 className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
                        {t.accounts.providerGroups[group]}
                      </h3>
                      <ul>
                        {items.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => pick(p.id, p)}
                              className={clsx(
                                "flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-2",
                                value === p.id && "bg-brand-soft/60",
                              )}
                            >
                              <ProviderLogo provider={p} />
                              <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                              {value === p.id && <Check className="size-5 text-brand" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
                {results.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-muted">{t.accounts.providerNoMatch}</p>
                )}
              </div>

              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={() => pick(OTHER)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium hover:bg-surface-2"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-2 text-muted">
                    <PencilLine className="size-5" />
                  </span>
                  {t.accounts.providerOther}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
