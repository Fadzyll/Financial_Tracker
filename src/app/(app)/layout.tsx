import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";
import { BottomNav, SidebarNav } from "@/components/nav";
import { LanguageToggle } from "@/components/language-toggle";
import { requireUser } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const { t } = await getI18n();

  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 font-bold">
          <Image src="/icons/icon.svg" alt="" width={32} height={32} />
          {t.appName}
        </Link>
        <SidebarNav />
        <div className="mt-auto px-2">
          <LanguageToggle />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-bg/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
          <Link href="/dashboard" className="flex min-h-14 flex-1 items-center gap-2 font-bold">
            <Image src="/icons/icon.svg" alt="" width={28} height={28} />
            {t.appName}
          </Link>
          <LanguageToggle />
          <Link
            href="/settings"
            aria-label={t.nav.settings}
            className="inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          >
            <Settings className="size-5" />
          </Link>
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-12">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
