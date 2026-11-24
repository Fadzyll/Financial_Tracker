import Image from "next/image";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { getI18n } from "@/lib/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-dvh flex-col px-4 py-6">
      <div className="flex items-center justify-end gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
        <div className="mb-8 text-center">
          <Image src="/icons/icon.svg" alt="" width={56} height={56} className="mx-auto mb-3" priority />
          <h1 className="text-2xl font-bold">{t.appName}</h1>
          <p className="mt-1 text-sm text-muted">{t.appTagline}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
