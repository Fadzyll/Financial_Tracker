import clsx from "clsx";
import { Banknote, Gem, Landmark, PiggyBank, Smartphone, TrendingUp, Wallet } from "lucide-react";
import type { AccountType } from "@/lib/types";
import { getProvider } from "@/lib/providers";
import { ProviderLogo } from "@/components/provider-logo";

export const ACCOUNT_TYPE_ICONS: Record<AccountType, typeof Wallet> = {
  bank: Landmark,
  ewallet: Smartphone,
  cash: Banknote,
  investment: TrendingUp,
  gold: Gem,
  retirement: PiggyBank,
  other: Wallet,
};

/** Provider logo/badge when the account has a known provider, else the type icon. */
export function AccountIcon({
  type,
  provider,
  className,
}: {
  type: AccountType;
  provider?: string | null;
  className?: string;
}) {
  const known = getProvider(provider);
  if (known) return <ProviderLogo provider={known} className={className} />;
  const Icon = ACCOUNT_TYPE_ICONS[type] ?? Wallet;
  return (
    <span
      className={clsx(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong",
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}
