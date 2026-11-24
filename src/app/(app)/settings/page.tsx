import { Download, Languages, LogOut, ShieldCheck, Tags, UserRound, X } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { buttonClass } from "@/components/button-class";
import { LanguageToggle } from "@/components/language-toggle";
import { PageHeader } from "@/components/page-header";
import { Card, SubmitButton } from "@/components/ui";
import { Avatar } from "@/components/user-menu";
import { getCategories } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { categoryLabel } from "@/lib/labels";
import { requireUser } from "@/lib/supabase/server";
import { deleteCategory } from "./actions";
import { AddCategoryForm, ProfileForm } from "./forms";

function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {hint && <p className="text-sm text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

export default async function SettingsPage() {
  const { t } = await getI18n();
  const { supabase, userId, email } = await requireUser();
  const [profile, categories] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    getCategories(),
  ]);
  const name = profile.data?.display_name ?? "";

  return (
    <div className="space-y-4">
      <PageHeader title={t.settings.title} />

      {/* Account: who is logged in + log out, right at the top */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar name={name} email={email} className="size-12 text-base" />
          <div className="min-w-0">
            <p className="text-xs text-muted">{t.settings.loggedInAs}</p>
            {name && <p className="truncate font-semibold">{name}</p>}
            <p className="truncate text-sm text-muted">{email}</p>
          </div>
        </div>
        <form action={signOut}>
          <SubmitButton variant="danger" className="w-full sm:w-auto">
            <LogOut className="size-4" /> {t.auth.signOut}
          </SubmitButton>
        </form>
      </Card>

      <Section icon={UserRound} title={t.settings.profile} hint={t.settings.profileHint}>
        <ProfileForm displayName={name} />
      </Section>

      <Section icon={Languages} title={t.common.language} hint={t.settings.languageHint}>
        <LanguageToggle className="text-sm" />
      </Section>

      <Section icon={Tags} title={t.settings.categories} hint={t.settings.categoriesHint}>
        {(["expense", "income"] as const).map((kind) => (
          <div key={kind}>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
              {kind === "income" ? t.settings.income : t.settings.expense}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.kind === kind)
                .map((c) => (
                  <li
                    key={c.id}
                    className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-2 py-0.5 pr-0.5 pl-3 text-sm"
                  >
                    {categoryLabel(c, t)}
                    <form action={deleteCategory.bind(null, c.id)}>
                      <SubmitButton
                        variant="ghost"
                        className="min-h-8 rounded-full px-2"
                        confirmMessage={t.common.confirmDelete}
                      >
                        <X className="size-3.5" aria-label={`${t.common.delete} ${categoryLabel(c, t)}`} />
                      </SubmitButton>
                    </form>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <div className="border-t border-border pt-4">
          <AddCategoryForm />
        </div>
      </Section>

      <Section icon={ShieldCheck} title={t.settings.yourData} hint={t.settings.yourDataHint}>
        <a href="/export" className={buttonClass("secondary", "w-full sm:w-auto")} download>
          <Download className="size-4" /> {t.settings.exportCsv}
        </a>
        <p className="flex items-start gap-2 text-xs text-muted">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand" /> {t.settings.privacy}
        </p>
      </Section>
    </div>
  );
}
