"use client";

import clsx from "clsx";
import { useActionState, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ACCOUNT_TYPE_ICONS } from "@/components/account-icon";
import { OTHER, ProviderPicker } from "@/components/provider-picker";
import { ButtonLink, Card, Field, FormError, Input, SubmitButton, noAutofill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { senToInput } from "@/lib/money";
import { GROUPS_FOR_TYPE, getProvider } from "@/lib/providers";
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

  const [type, setType] = useState<AccountType>(account?.type ?? "bank");
  const [provider, setProvider] = useState<string>(
    getProvider(account?.provider) ? account!.provider! : account?.institution ? OTHER : "",
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const groups = GROUPS_FOR_TYPE[type];
  const showProvider = groups.length > 0;

  function chooseType(next: AccountType) {
    setType(next);
    // Drop a chosen provider that doesn't belong to the new type.
    const current = getProvider(provider);
    if (current && !GROUPS_FOR_TYPE[next].includes(current.group)) setProvider("");
    if (GROUPS_FOR_TYPE[next].length === 0 && provider !== "") setProvider("");
  }

  return (
    <Card>
      <form action={formAction} className="space-y-5" autoComplete="off">
        <FormError message={state.error} />
        <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand-strong">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" /> {t.accounts.privacyNote}
        </p>

        {/* 1. Type */}
        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium">{t.accounts.type}</legend>
          <input type="hidden" name="type" value={type} />
          <div role="radiogroup" aria-label={t.accounts.type} className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {ACCOUNT_TYPES.map((value) => {
              const Icon = ACCOUNT_TYPE_ICONS[value];
              const active = type === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => chooseType(value)}
                  className={clsx(
                    "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center text-xs font-medium transition-colors",
                    active
                      ? "border-brand bg-brand-soft text-brand-strong"
                      : "border-border text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="leading-tight">{t.accountTypes[value]}</span>
                </button>
              );
            })}
          </div>
          {fe.type && <p className="mt-1 text-xs font-medium text-danger">{fe.type}</p>}
        </fieldset>

        {/* 2. Bank / provider, filtered by type (hidden for cash) */}
        <input type="hidden" name="provider" value={provider === OTHER ? "" : provider} />
        {showProvider && (
          <Field label={t.accounts.institution} htmlFor="provider">
            <ProviderPicker
              key={type}
              id="provider"
              value={provider}
              groups={groups}
              onChange={(next, p) => {
                setProvider(next);
                if (p && nameRef.current && !nameRef.current.value.trim()) nameRef.current.value = p.name;
              }}
            />
          </Field>
        )}

        {showProvider && provider === OTHER && (
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

        {/* 3. Name */}
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

        {/* 4. Balance */}
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
