import { Download, LogOut, ShieldCheck, X } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { LanguageToggle } from "@/components/language-toggle";
import { PageHeader } from "@/components/page-header";
import { buttonClass } from "@/components/button-class";
import { Card, SubmitButton } from "@/components/ui";
import { getCategories } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { categoryLabel } from "@/lib/labels";
import { requireUser } from "@/lib/supabase/server";
import { deleteCategory } from "./actions";
import { AddCategoryForm, ProfileForm } from "./forms";

export default async function SettingsPage() {
  const { t } = await getI18n();
  const { supabase, userId, email } = await requireUser();
  const [profile, categories] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t.settings.title} />

      <Card className="space-y-4">
        <h2 className="font-semibold">{t.settings.profile}</h2>
        <p className="text-sm text-muted">{email}</p>
        <ProfileForm displayName={profile.data?.display_name ?? ""} />
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-medium">{t.common.language}</span>
          <LanguageToggle />
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold">{t.settings.categories}</h2>
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
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 py-1 pr-1 pl-3 text-sm"
                  >
                    {categoryLabel(c, t)}
                    <form action={deleteCategory.bind(null, c.id)}>
                      <SubmitButton
                        variant="ghost"
                        className="min-h-7 rounded-full px-1.5"
                        confirmMessage={t.common.confirmDelete}
                      >
                        <X className="size-3.5" aria-label={t.common.delete} />
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
      </Card>

      <Card className="space-y-3">
        <p className="flex items-start gap-2 text-sm text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" /> {t.settings.privacy}
        </p>
        <a href="/export" className={buttonClass("secondary", "w-full")} download>
          <Download className="size-4" /> {t.settings.exportCsv}
        </a>
        <form action={signOut}>
          <SubmitButton variant="danger" className="w-full">
            <LogOut className="size-4" /> {t.auth.signOut}
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
