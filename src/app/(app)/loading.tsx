import { getI18n } from "@/lib/i18n/server";

/** Shown instantly while the next page loads. Fades in after a short delay so fast loads don't flicker. */
export default async function Loading() {
  const { t } = await getI18n();
  return (
    <div role="status" className="flex min-h-[50dvh] items-center justify-center opacity-0 [animation:fade-in_200ms_150ms_forwards]">
      <span className="size-8 animate-spin rounded-full border-[3px] border-brand/25 border-t-brand" aria-hidden />
      <span className="sr-only">{t.common.loading}</span>
    </div>
  );
}
