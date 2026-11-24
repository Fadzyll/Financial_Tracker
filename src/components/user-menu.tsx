"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { useI18n } from "@/lib/i18n/client";
import { SupportMenuItem } from "@/components/support-link";

function initials(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Avatar({ name, email, className }: { name: string; email: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-strong",
        className,
      )}
    >
      {initials(name, email)}
    </span>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  return (
    <form action={signOut} onSubmit={() => setPending(true)}>
      <button
        type="submit"
        disabled={pending}
        className={clsx(
          "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-danger hover:bg-danger-soft disabled:opacity-60",
          className,
        )}
      >
        <LogOut className="size-5" /> {t.auth.signOut}
      </button>
    </form>
  );
}

/** Phone header: avatar button that opens Settings / Log out. */
export function MobileUserMenu({ name, email }: { name: string; email: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name || email}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Avatar name={name} email={email} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl"
        >
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={name} email={email} />
            <div className="min-w-0">
              {name && <p className="truncate text-sm font-semibold">{name}</p>}
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
          <div className="my-1 border-t border-border" />
          <Link
            href="/settings"
            role="menuitem"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-surface-2"
          >
            <Settings className="size-5 text-muted" /> {t.nav.settings}
          </Link>
          <SupportMenuItem />
          <div className="my-1 border-t border-border" />
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
