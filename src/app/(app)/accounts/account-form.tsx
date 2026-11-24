"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { ButtonLink, Card, Field, FormError, Input, Select, SubmitButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { senToInput } from "@/lib/money";
import { ACCOUNT_TYPES, type AccountWithBalance } from "@/lib/types";
import type { FormState } from "@/lib/validation";

export function AccountForm({
  action,
  account,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  account?: AccountWithBalance;
  cancelHref: string;
}) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <FormError message={state.error} />
        <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand-strong">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" /> {t.accounts.privacyNote}
        </p>
        <Field label={t.accounts.name} htmlFor="name" error={fe.name}>
          <Input
            id="name"
            name="name"
            required
            maxLength={60}
            placeholder={t.accounts.namePlaceholder}
            defaultValue={account?.name}
          />
        </Field>
        <Field label={t.accounts.type} htmlFor="type" error={fe.type}>
          <Select id="type" name="type" defaultValue={account?.type ?? "bank"}>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t.accountTypes[type]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.accounts.institution} htmlFor="institution" optional>
          <Input
            id="institution"
            name="institution"
            maxLength={60}
            placeholder={t.accounts.institutionPlaceholder}
            defaultValue={account?.institution ?? ""}
          />
        </Field>
        <Field
          label={account ? t.accounts.openingBalanceEdit : t.accounts.openingBalance}
          htmlFor="opening_balance"
          hint={t.accounts.openingBalanceHint}
          error={fe.opening_balance}
        >
          <Input
            id="opening_balance"
            name="opening_balance"
            inputMode="decimal"
            placeholder="0.00"
            className="tabular"
            defaultValue={account ? senToInput(account.opening_balance) : ""}
          />
        </Field>
        <div className="flex gap-3 pt-2">
          <ButtonLink href={cancelHref} variant="secondary" className="flex-1">
            {t.common.cancel}
          </ButtonLink>
          <SubmitButton className="flex-1">{t.common.save}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
