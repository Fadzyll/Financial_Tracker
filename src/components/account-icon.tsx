import clsx from "clsx";
import { Banknote, Gem, Landmark, PiggyBank, Smartphone, TrendingUp, Wallet } from "lucide-react";
import type { AccountType } from "@/lib/types";

const ICONS: Record<AccountType, typeof Wallet> = {
  bank: Landmark,
  ewallet: Smartphone,
  cash: Banknote,
  investment: TrendingUp,
  gold: Gem,
  retirement: PiggyBank,
  other: Wallet,
};

export function AccountIcon({ type, className }: { type: AccountType; className?: string }) {
  const Icon = ICONS[type] ?? Wallet;
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
