import { requireUser } from "@/lib/supabase/server";
import { todayISO } from "@/lib/dates";

/** Quote a CSV cell and neutralise spreadsheet formulas in text fields. */
function cell(value: unknown, isText = false) {
  let s = value === null || value === undefined ? "" : String(value);
  if (isText && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const { supabase } = await requireUser();
  const [{ data: txns }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase.from("transactions").select("*").order("occurred_on").order("created_at"),
    supabase.from("accounts").select("id, name"),
    supabase.from("categories").select("id, name"),
  ]);

  const accountName = new Map((accounts ?? []).map((a) => [a.id, a.name]));
  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const header = ["date", "type", "amount_rm", "account", "to_account", "category", "note"];
  const rows = (txns ?? []).map((tx) =>
    [
      cell(tx.occurred_on),
      cell(tx.kind),
      cell((tx.amount / 100).toFixed(2)),
      cell(accountName.get(tx.account_id), true),
      cell(tx.to_account_id ? accountName.get(tx.to_account_id) : "", true),
      cell(tx.category_id ? categoryName.get(tx.category_id) : "", true),
      cell(tx.note, true),
    ].join(","),
  );

  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${todayISO()}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
