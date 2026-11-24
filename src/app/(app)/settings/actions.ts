"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";
import { dbErrorMessage } from "@/lib/db-errors";
import { flash } from "@/lib/flash";
import { isUuid, str, type FormState } from "@/lib/validation";

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState & { ok?: boolean }> {
  const { supabase, userId } = await requireUser();
  const { t } = await getI18n();
  const displayName = str(formData, "display_name", 60) || null;
  const { error } = await supabase.from("profiles").upsert({ id: userId, display_name: displayName });
  if (error) return { error: dbErrorMessage(error, t, "updateProfile") };
  await flash("profileSaved");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addCategory(_: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const name = str(formData, "category_name", 40);
  const kind = str(formData, "kind") === "income" ? "income" : "expense";
  if (!name) return { fieldErrors: { name: t.common.required } };

  const { error } = await supabase.from("categories").insert({ name, kind });
  if (error) {
    return error.code === "23505"
      ? { fieldErrors: { name: t.settings.categoryExists } }
      : { error: dbErrorMessage(error, t, "addCategory") };
  }
  await flash("categoryAdded");
  revalidatePath("/settings");
  return {};
}

export async function deleteCategory(id: string) {
  if (!isUuid(id)) return;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (!error) await flash("categoryDeleted");
  revalidatePath("/", "layout");
}
