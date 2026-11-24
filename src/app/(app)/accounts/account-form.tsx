"use client";

import { useActionState, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { OTHER, ProviderPicker } from "@/components/provider-picker";
import { ButtonLink, Card, Field, FormError, Input, Select, SubmitButton, noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { senToInput } from "@/lib/money";
import { getProvider } from "@/lib/providers";
import { ACCOUNT_TYPES, type AccountType, type AccountWithBalance } from "@/lib/types";
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

  const [provider, setProvider] = useState<string>(
    getProvider(account?.provider) ? account!.provider! : account?.institution ? OTHER : "",
  );
  const [type, setType] = useState<AccountType>(account?.type ?? "bank");
  const nameRef = useRef<HTMLInputElement>(null);
  const typeTouched = useRef(Boolean(account));

  return (
    <Card>
      <form action={formAction} className="space-y-4" autoComplete="off">
        <FormError message={state.error} />
        <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand-strong">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" /> {t.accounts.privacyNote}
        </p>

        <Field label={t.accounts.institution} htmlFor="provider" optional>
          <ProviderPicker
            id="provider"
            value={provider}
            onChange={(next, p) => {
              setProvider(next);
              if (!p) return;
              // Helpful defaults: matching type, and a name if none typed yet.
              if (!typeTouched.current) setType(p.type);
              if (nameRef.current && !nameRef.current.value.trim()) nameRef.current.value = p.name;
            }}
          />
          <input type="hidden" name="provider" value={provider === OTHER ? "" : provider} />
        </Field>

        {provider === OTHER && (
          <Field label={t.accounts.providerCustom} htmlFor="institution">
            <Input
              id="institution"
              name="institution"
              maxLength={60}
              placeholder={t.accounts.institutionPlaceholder}
              defaultValue={getProvider(account?.provider) ? "" : (account?.institution ?? "")}
              {...noAutofill}
            />
          </Field>
        )}

        <Field label={t.accounts.name} htmlFor="account_name" error={fe.name}>
          <Input
            ref={nameRef}
            id="account_name"
            name="account_name"
            required
            maxLength={60}
            placeholder={t.accounts.namePlaceholder}
            defaultValue={account?.name}
            {...noAutofill}
          />
        </Field>

        <Field label={t.accounts.type} htmlFor="type" error={fe.type}>
          <Select
            id="type"
            name="type"
            value={type}
            onChange={(e) => {
              typeTouched.current = true;
              setType(e.target.value as AccountType);
            }}
          >
            {ACCOUNT_TYPES.map((value) => (
              <option key={value} value={value}>
                {t.accountTypes[value]}
              </option>
            ))}
          </Select>
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
            {...noAutofill}
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
