import clsx from "clsx";
import type { Provider } from "@/lib/providers";

/**
 * Provider logo: the real logo file when one is configured, otherwise a
 * brand-coloured badge with the provider's short code.
 */
export function ProviderLogo({ provider, className }: { provider: Provider; className?: string }) {
  if (provider.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={provider.logo}
        alt=""
        className={clsx("size-10 shrink-0 rounded-xl bg-white object-contain p-1", className)}
      />
    );
  }
  const len = provider.short.length;
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl font-extrabold tracking-tight shadow-sm ring-1 ring-black/5",
        len <= 2 ? "text-[13px]" : len === 3 ? "text-[11px]" : "text-[9.5px]",
        className,
      )}
      style={{ backgroundColor: provider.color, color: provider.fg ?? "#ffffff" }}
    >
      {provider.short}
    </span>
  );
}
