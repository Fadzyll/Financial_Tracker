import "server-only";
import { cookies } from "next/headers";

export const FLASH_COOKIE = "flash";

export type FlashKey =
  | "accountCreated"
  | "accountUpdated"
  | "accountDeleted"
  | "accountArchived"
  | "accountRestored"
  | "valueUpdated"
  | "txCreated"
  | "txUpdated"
  | "txDeleted"
  | "goalCreated"
  | "goalUpdated"
  | "goalDeleted"
  | "categoryAdded"
  | "categoryDeleted"
  | "profileSaved"
  | "passwordChanged";

/** Queue a one-off success message; the <Toaster> shows it on the next screen. */
export async function flash(key: FlashKey, action?: { href: string }) {
  (await cookies()).set(FLASH_COOKIE, JSON.stringify({ key, href: action?.href, id: Date.now() }), {
    path: "/",
    maxAge: 30,
    sameSite: "lax",
  });
}
