"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";

/** Debounced search that lives in the URL (?q=), so back/refresh keep it. */
export function SearchBox() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      router.replace(`${pathname}?${next}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.transactions.search}
        aria-label={t.transactions.search}
        className="block min-h-11 w-full rounded-xl border border-border bg-surface pr-10 pl-9 text-base text-text placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        {...noAutofill}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label={t.common.cancel}
          className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
