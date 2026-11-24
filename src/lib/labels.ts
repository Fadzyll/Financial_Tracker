import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Category } from "@/lib/types";

/** Built-in categories are translated; custom ones show the name the user typed. */
export function categoryLabel(cat: Pick<Category, "key" | "name"> | null | undefined, t: Dictionary) {
  if (!cat) return "";
  return (cat.key && t.categories[cat.key]) || cat.name;
}
