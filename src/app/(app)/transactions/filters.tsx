"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import type { AccountWithBalance } from "@/lib/types";

export function AccountFilter({
  accounts,
  month,
  value,
}: {
  accounts: AccountWithBalance[];
  month: string;
  value?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Select
      aria-label={t.transactions.account}
      value={value ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams({ month });
        if (e.target.value) params.set("account", e.target.value);
        router.push(`/transactions?${params}`);
      }}
    >
      <option value="">{t.transactions.allAccounts}</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </Select>
  );
}
