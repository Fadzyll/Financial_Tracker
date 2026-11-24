"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-10 max-w-md text-center">
      <AlertTriangle className="mx-auto mb-3 size-8 text-danger" />
      <h1 className="text-lg font-semibold">{t.common.genericError}</h1>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted">ref: {error.digest}</p>}
      <Button className="mt-5" onClick={reset}>
        {t.common.retry}
      </Button>
    </Card>
  );
}
