import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { getI18n } from "@/lib/i18n/server";
import { PRIVACY } from "@/lib/i18n/privacy";
import { SUPPORT_URL } from "@/lib/support";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  return { title: PRIVACY[locale].title };
}

/** Public page: readable whether or not you're logged in. */
export default async function PrivacyPage() {
  const { locale, t } = await getI18n();
  const p = PRIVACY[locale];
  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto flex max-w-2xl items-center gap-2">
        <Link href="/dashboard" className="flex flex-1 items-center gap-2 font-bold">
          <Image src="/icons/icon.svg" alt="" width={28} height={28} />
          {t.appName}
        </Link>
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <main className="mx-auto max-w-2xl py-8">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
          <ChevronLeft className="size-4" /> {t.common.back}
        </Link>
        <h1 className="text-2xl font-bold">{p.title}</h1>
        <p className="mt-1 text-xs text-muted">{p.updated}</p>
        <p className="mt-4 text-base leading-relaxed">{p.intro}</p>
        {p.sections.map((section) => (
          <section key={section.title} className="mt-7">
            <h2 className="mb-2 text-lg font-semibold">{section.title}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-text/90 marker:text-brand">
              {section.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
        <p className="mt-8">
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand">
            {t.support.title} ↗
          </a>
        </p>
      </main>
    </div>
  );
}
