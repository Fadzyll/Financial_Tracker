"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Home, Plus, Settings, Target, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

function useItems() {
  const { t } = useI18n();
  return [
    { href: "/dashboard", label: t.nav.dashboard, icon: Home },
    { href: "/accounts", label: t.nav.accounts, icon: Wallet },
    { href: "/transactions", label: t.nav.transactions, icon: ArrowLeftRight },
    { href: "/goals", label: t.nav.goals, icon: Target },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = useItems();
  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/transactions/new"
        className="mb-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-on-brand hover:bg-brand-strong"
      >
        <Plus className="size-4" /> {t.transactions.add}
      </Link>
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className={clsx(
            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
            isActive(pathname, href)
              ? "bg-brand-soft text-brand-strong"
              : "text-muted hover:bg-surface-2 hover:text-text",
          )}
        >
          <Icon className="size-5" /> {label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [dash, accounts, txns, goals] = useItems();
  const tab = ({ href, label, icon: Icon }: (typeof accounts)) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive(pathname, href) ? "page" : undefined}
      className={clsx(
        "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
        isActive(pathname, href) ? "text-brand" : "text-muted",
      )}
    >
      <Icon className="size-5" />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch">
        {tab(dash)}
        {tab(accounts)}
        <div className="flex flex-1 items-center justify-center">
          <Link
            href="/transactions/new"
            aria-label={t.transactions.add}
            className="-mt-6 inline-flex size-14 items-center justify-center rounded-full bg-brand text-on-brand shadow-lg ring-4 ring-bg"
          >
            <Plus className="size-7" />
          </Link>
        </div>
        {tab(txns)}
        {tab(goals)}
      </div>
    </nav>
  );
}
