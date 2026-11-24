import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-2">
      {backHref && (
        <Link
          href={backHref}
          className="-ml-2 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Link>
      )}
      <h1 className="min-w-0 flex-1 truncate text-xl font-bold sm:text-2xl">{title}</h1>
      {action}
    </div>
  );
}
