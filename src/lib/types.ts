export const ACCOUNT_TYPES = [
  "bank",
  "ewallet",
  "cash",
  "investment",
  "gold",
  "retirement",
  "other",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type TransactionKind = "income" | "expense" | "transfer" | "adjustment";
export type CategoryKind = "income" | "expense";

/** Row of the `account_balances` view. Money values are in sen. */
export interface AccountWithBalance {
  id: string;
  name: string;
  institution: string | null;
  type: AccountType;
  opening_balance: number;
  currency: string;
  archived: boolean;
  created_at: string;
  balance: number;
}

export interface Category {
  id: string;
  key: string | null;
  name: string;
  kind: CategoryKind;
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  amount: number;
  occurred_on: string;
  note: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  scope: "all" | "accounts";
  archived: boolean;
  created_at: string;
  goal_accounts: { account_id: string }[];
}
