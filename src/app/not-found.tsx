import Image from "next/image";
import { ButtonLink } from "@/components/ui";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Image src="/icons/icon.svg" alt="" width={56} height={56} className="mb-4" />
      <h1 className="text-xl font-bold">{t.common.notFoundTitle}</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">{t.common.notFoundBody}</p>
      <ButtonLink href="/dashboard" className="mt-6">
        {t.common.backHome}
      </ButtonLink>
    </main>
  );
}
