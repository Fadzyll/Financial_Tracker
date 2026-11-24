import { SearchX } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { getI18n } from "@/lib/i18n/server";

export default async function AppNotFound() {
  const { t } = await getI18n();
  return (
    <Card className="mx-auto mt-10 max-w-md text-center">
      <SearchX className="mx-auto mb-3 size-8 text-muted" />
      <h1 className="text-lg font-semibold">{t.common.notFoundTitle}</h1>
      <p className="mt-1 text-sm text-muted">{t.common.notFoundBody}</p>
      <ButtonLink href="/dashboard" className="mt-5">
        {t.common.backHome}
      </ButtonLink>
    </Card>
  );
}
